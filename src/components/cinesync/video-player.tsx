
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ShieldCheck,
  Signal,
  ScreenShare,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getDiscussionStarters } from '@/app/actions';
import { initializeSync, syncState, onStateChange, type PlayerState } from '@/lib/firebase-sync';

function formatTime(seconds: number) {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
        return `${hh}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
}

interface VideoPlayerProps {
  movieTitle?: string;
  partyId?: string;
}

interface Reaction {
    id: number;
    emoji: string;
}

const IS_HOST = true; // For this prototype, we'll assume the user is the host.

export default function VideoPlayer({ movieTitle, partyId }: VideoPlayerProps) {
  const { toast } = useToast();
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    videoSrc: null,
    stream: null,
    duration: 0,
    currentTime: 0,
    videoTitle: movieTitle || 'Movie Title',
  });
  
  const [reactions, setReactions] = useState<Reaction[]>([]);
  let reactionId = 0;

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const lastSyncTime = useRef(0);

  const handleDiscussionStart = useCallback(async (title: string) => {
    const result = await getDiscussionStarters({ movieTitle: title });
    if (result.questions) {
      const event = new CustomEvent('discussion-starters', { detail: result.questions });
      window.dispatchEvent(event);
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Could not generate discussion starters',
        description: result.error,
      });
    }
  }, [toast]);

  useEffect(() => {
    if (movieTitle) {
      updateState({ videoTitle: movieTitle });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieTitle]);

  useEffect(() => {
    if (!partyId) return;

    initializeSync(partyId);

    const cleanup = onStateChange((newState) => {
      setPlayerState(prevState => {
        if (newState.videoSrc !== prevState.videoSrc) {
            // Special handling for video source change
            return { ...prevState, ...newState, videoSrc: newState.videoSrc };
        }
        return { ...prevState, ...newState };
      });
      
      if (videoRef.current && newState) {
        if (!IS_HOST) {
          if (newState.isPlaying && videoRef.current.paused) {
            videoRef.current.play();
          } else if (!newState.isPlaying && !videoRef.current.paused) {
            videoRef.current.pause();
          }
          if (Math.abs(videoRef.current.currentTime - newState.currentTime) > 2) {
              videoRef.current.currentTime = newState.currentTime;
          }
        }
      }
    });

    return cleanup;
  }, [partyId]);

  useEffect(() => {
    const handleNewReaction = (event: Event) => {
        const customEvent = event as CustomEvent<string>;
        const newReaction: Reaction = { id: reactionId++, emoji: customEvent.detail };
        setReactions(prev => [...prev, newReaction]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
    };

    window.addEventListener('emoji-reaction', handleNewReaction);
    return () => {
        window.removeEventListener('emoji-reaction', handleNewReaction);
    }
  }, []);
  
  const stopCurrentStream = () => {
    if (playerState.stream) {
      playerState.stream.getTracks().forEach(track => track.stop());
    }
    if (playerState.videoSrc && videoRef.current) {
      URL.revokeObjectURL(playerState.videoSrc);
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  }

  const updateState = (newState: Partial<PlayerState>) => {
    setPlayerState(prevState => {
        const updatedState = { ...prevState, ...newState };
        if (IS_HOST && partyId) {
            syncState(updatedState);
        }
        return updatedState;
    });
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playerState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      updateState({ isPlaying: !playerState.isPlaying, currentTime: videoRef.current.currentTime });
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      const newMuted = !playerState.isMuted;
      videoRef.current.muted = newMuted;
      updateState({ isMuted: newMuted });
    }
  };

  const handleFullscreen = () => {
    const videoContainer = playerContainerRef.current;
    if (!videoContainer) return;

    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => {
          toast({
            variant: 'destructive',
            title: 'Fullscreen Error',
            description: `Could not enter fullscreen mode: ${err.message}.`,
          });
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && IS_HOST) {
      stopCurrentStream();
      const url = URL.createObjectURL(file);
      updateState({ videoSrc: url, videoTitle: file.name, isPlaying: false, stream: null });
    }
  };
  
  const handleSliderChange = (value: number[]) => {
      if (videoRef.current && IS_HOST) {
          videoRef.current.currentTime = value[0];
          updateState({ currentTime: value[0] });
      }
  };

  const handleUploadClick = () => {
    if(IS_HOST) fileInputRef.current?.click();
  };

  const handleScreenShare = async () => {
    if (!IS_HOST) return;
    stopCurrentStream();
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Cannot sync screen share blobs, so this will be local only for now.
      updateState({ stream: screenStream, videoTitle: 'Screen Share', videoSrc: null });
      
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopCurrentStream();
        updateState({ isPlaying: false, stream: null, videoTitle: movieTitle || 'Movie Title' });
      });

    } catch (error: any) {
        if (error.name === 'NotAllowedError') {
             toast({
                variant: 'destructive',
                title: 'Screen Share Failed',
                description: 'Permission to share screen was denied. Please try again.',
            });
        } else if (error.name === 'SecurityError' || error.name === 'NotSupportedError') {
             toast({
                variant: 'destructive',
                title: 'Screen Share Blocked',
                description: 'Your browser or environment has blocked screen sharing for security reasons. Try opening the app in a new tab.',
            });
        }
        else {
            console.error('Screen share error:', error);
            toast({
                variant: 'destructive',
                title: 'Screen Share Failed',
                description: 'An unexpected error occurred. Please check the console.',
            });
        }
    }
  };
  
  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: 'Invite Link Copied!',
        description: 'The link to this watch party has been copied to your clipboard.',
    })
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const onLoadedMetadata = () => updateState({ duration: videoElement.duration });
    const onPlay = () => !playerState.isPlaying && updateState({isPlaying: true});
    const onPause = () => playerState.isPlaying && updateState({isPlaying: false});
    const onTimeUpdate = () => {
      const now = Date.now();
      if (IS_HOST && now - lastSyncTime.current > 1000) {
        lastSyncTime.current = now;
        updateState({ currentTime: videoElement.currentTime });
      } else {
        setPlayerState(s => ({...s, currentTime: videoElement.currentTime}));
      }
    }
    const onEnded = () => {
      if (IS_HOST && playerState.videoTitle && playerState.videoTitle !== 'Screen Share') {
        handleDiscussionStart(playerState.videoTitle);
      }
      updateState({isPlaying: false});
    }
    const onFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      updateState({ isFullscreen: isCurrentlyFullscreen });
    }
    
    videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
    videoElement.addEventListener('play', onPlay);
    videoElement.addEventListener('pause', onPause);
    videoElement.addEventListener('timeupdate', onTimeUpdate);
    videoElement.addEventListener('ended', onEnded);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      videoElement.removeEventListener('play', onPlay);
      videoElement.removeEventListener('pause', onPause);
      videoElement.removeEventListener('timeupdate', onTimeUpdate);
      videoElement.removeEventListener('ended', onEnded);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerState.videoSrc]); // Rerun when src changes

  useEffect(() => {
    const videoElement = videoRef.current;
    if(!videoElement) return;
    if (playerState.stream && videoElement.srcObject !== playerState.stream) {
      videoElement.srcObject = playerState.stream;
      videoElement.play();
    } else if (playerState.videoSrc && videoElement.src !== playerState.videoSrc) {
      videoElement.src = playerState.videoSrc;
      if (playerState.isPlaying) videoElement.play();
    }

  }, [playerState.stream, playerState.videoSrc, playerState.isPlaying])


  return (
    <TooltipProvider>
      <div ref={playerContainerRef} className="relative w-full aspect-video bg-black rounded-lg shadow-2xl overflow-hidden group">
        <video
          ref={videoRef}
          className={`w-full h-full object-contain ${!playerState.videoSrc && !playerState.stream ? 'hidden' : ''}`}
          controls={false}
          onClick={IS_HOST ? handlePlayPause : undefined}
          muted={playerState.isMuted}
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {reactions.map(r => (
                <div key={r.id} className="absolute text-5xl animate-float-up"
                    style={{
                        left: `${Math.random() * 80 + 10}%`,
                        bottom: '-50px',
                        animationDuration: `${Math.random() * 2 + 2}s`
                    }}
                >{r.emoji}</div>
            ))}
        </div>

        {!playerState.videoSrc && !playerState.stream && (
          <>
            <Image
              src="https://placehold.co/1920x1080.png"
              alt="Movie placeholder"
              fill
              className="object-cover"
              data-ai-hint="cinema screen"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-20">
              <h3 className="text-2xl font-bold text-white mb-6">{IS_HOST ? "Host controls" : "Waiting for host to start..."}</h3>
              {IS_HOST && (
                <div className="flex gap-4">
                  <Button onClick={handleScreenShare} size="lg">
                    <ScreenShare className="mr-2" /> Share Your Screen
                  </Button>
                  <Button onClick={handleUploadClick} variant="secondary" size="lg">
                    <Upload className="mr-2" /> Upload a Movie
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="video/*"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <h2 className="text-lg font-headline text-white drop-shadow-lg truncate max-w-sm">{playerState.videoTitle}</h2>
           <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleInvite} className="text-white hover:bg-white/10 hover:text-white">
                <LinkIcon className="mr-2"/>
                Invite
            </Button>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <ShieldCheck size={16} />
              <span className="font-medium">{IS_HOST ? "Host" : "Viewer"}</span>
            </div>
             <div className="flex items-center gap-2 text-xs text-cyan-400">
              <Signal size={16} />
              <span className="font-medium">Good</span>
            </div>
           </div>
        </div>

        {(playerState.videoSrc || playerState.stream) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-4 mb-2">
                <div className="text-white text-sm font-mono">{formatTime(playerState.currentTime)}</div>
                <Slider value={[playerState.currentTime]} max={playerState.duration} step={1} className="w-full" onValueChange={handleSliderChange} disabled={!playerState.duration || !IS_HOST} />
                <div className="text-white text-sm font-mono">{formatTime(playerState.duration)}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-white"
                        onClick={handlePlayPause}
                        disabled={!IS_HOST}
                    >
                        {playerState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>{playerState.isPlaying ? 'Pause' : 'Play'}</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-white"
                        onClick={handleMute}
                    >
                        {playerState.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>{playerState.isMuted ? 'Unmute' : 'Mute'}</p>
                    </TooltipContent>
                </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 hover:text-white"
                            onClick={handleScreenShare}
                            disabled={!IS_HOST}
                        >
                            <ScreenShare size={20} />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Share Screen</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10 hover:text-white"
                            onClick={handleUploadClick}
                            disabled={!IS_HOST}
                        >
                            <Upload size={20} />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Upload Movie</p>
                        </TooltipContent>
                    </Tooltip>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="video/*"
                    />
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-white"
                    >
                        <Settings size={20} />
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>Settings</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10 hover:text-white"
                        onClick={handleFullscreen}
                    >
                        {playerState.isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>{playerState.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</p>
                    </TooltipContent>
                </Tooltip>
                </div>
            </div>
            </div>
        )}
      </div>
    </TooltipProvider>
  );
}
