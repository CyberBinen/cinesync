'use client';

import React, { useState, useRef, useEffect, useActionState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Play,
  Pause,
  StepForward,
  StepBack,
  Volume2,
  VolumeX,
  ListMusic,
  Link as LinkIcon,
  Wand2,
  Loader2,
  Music4,
  Mic,
  MicOff,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { getSoundtrackSuggestion } from '@/app/actions';
import { useFormStatus } from 'react-dom';

interface Track {
  file?: File;
  name: string;
  artist?: string;
  title?: string;
  url: string;
  isAiSuggestion: boolean;
}

function formatTime(seconds: number) {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
}

function AiSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Suggesting...
        </>
      ) : (
        <>
            <Wand2 className="mr-2" />
            Get Suggestions
        </>
      )}
    </Button>
  );
}

export function MusicPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  const [suggestionState, suggestionAction] = useActionState(getSoundtrackSuggestion, { message: "", suggestions: undefined, error: undefined });
  useEffect(() => {
    if (suggestionState?.suggestions?.songs) {
      toast({
        title: 'AI Suggestions Added!',
        description: 'We added the AI song ideas to your playlist.',
      });
      const newTracks: Track[] = suggestionState.suggestions.songs.map(song => ({
        name: `${song.title} by ${song.artist}`,
        title: song.title,
        artist: song.artist,
        url: '', 
        isAiSuggestion: true,
      }));
      setPlaylist(prev => [...prev, ...newTracks]);
    }
    if (suggestionState?.error) {
        toast({ variant: 'destructive', title: 'Error', description: suggestionState.error as string });
    }
  }, [suggestionState, toast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateCurrentTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleTrackEnd = () => handleNext();

      audio.addEventListener('timeupdate', updateCurrentTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleTrackEnd);

      return () => {
        audio.removeEventListener('timeupdate', updateCurrentTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleTrackEnd);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, playlist]);
  
  useEffect(() => {
    if (audioRef.current && currentTrack?.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
            console.error("Playback failed", e);
            setIsPlaying(false);
        });
    } else if(currentTrack && !currentTrack.url) {
        toast({ variant: 'destructive', title: "Cannot play track", description: `${currentTrack.name} is a suggestion and can't be played.`});
        setIsPlaying(false);
    }
  }, [currentTrack, toast]);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newTracks = Array.from(files).map(file => ({
        file,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
        isAiSuggestion: false,
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
    if (currentTrackIndex === null && newTracks.length > 0) {
      setCurrentTrackIndex(playlist.length);
    }
    toast({
        title: `${newTracks.length} song(s) added to the playlist!`,
    });
  };

  const handlePlayPause = () => {
    if (!audioRef.current || currentTrackIndex === null || !currentTrack?.url) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentTrackIndex === null || playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
  };

  const handlePrev = () => {
    if (currentTrackIndex === null || playlist.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    setCurrentTrackIndex(prevIndex);
  };
  
  const handleSeek = (value: number[]) => {
      if(audioRef.current) {
          audioRef.current.currentTime = value[0];
          setCurrentTime(value[0]);
      }
  }
  
  const handleMute = () => {
      if(audioRef.current) {
          audioRef.current.muted = !isMuted;
          setIsMuted(!isMuted);
      }
  }
  
  const selectTrack = (index: number) => {
      setCurrentTrackIndex(index);
  }
  
  const handleToggleMic = async () => {
    if (isMicOn) {
        micStream?.getTracks().forEach(track => track.stop());
        setMicStream(null);
        setIsMicOn(false);
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicStream(stream);
            setIsMicOn(true);
            toast({
                title: "Microphone enabled!",
                description: "You can now sing along. Others will hear you in a future update!",
            });
            // In a real app, you'd send this stream to other users via WebRTC
        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast({
                variant: 'destructive',
                title: 'Microphone Access Denied',
                description: 'Please enable microphone permissions in your browser settings.',
            });
        }
    }
  }

  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: 'Invite Link Copied!',
        description: 'The link to this music session has been copied.',
    })
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-3">
          <ListMusic />
          Music Sharing Session
        </CardTitle>
        <CardDescription>
          Upload songs, get AI suggestions, and sing along with friends. Invite others to listen together.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid lg:grid-cols-3 gap-6">
        <div className="flex flex-col bg-background/50 p-4 rounded-lg border lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Now Playing</h3>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex flex-col items-center justify-center text-center p-4 bg-muted/30 rounded-md min-h-[150px]">
                    {currentTrack ? (
                        <>
                            <p className="font-bold text-lg text-primary">{currentTrack.name}</p>
                            <p className="text-sm text-muted-foreground">{currentTrack.url ? "Playing from your local files" : "AI Suggestion"}</p>
                        </>
                    ) : (
                        <p className="text-muted-foreground">Upload a song or get suggestions to start</p>
                    )}
                </div>
                 <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-md min-h-[150px]">
                    <div className="mt-4 space-y-3 w-full">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <Slider value={[currentTime]} max={duration || 100} onValueChange={handleSeek} disabled={!currentTrack?.url} />
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <Button variant="ghost" size="icon" onClick={handleMute}>
                                {isMuted ? <VolumeX /> : <Volume2 />}
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={handlePrev} disabled={playlist.length < 2}>
                                    <StepBack />
                                </Button>
                                <Button size="lg" onClick={handlePlayPause} disabled={!currentTrack?.url}>
                                    {isPlaying ? <Pause /> : <Play />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleNext} disabled={playlist.length < 2}>
                                    <StepForward />
                                </Button>
                            </div>
                            <Button variant={isMicOn ? "destructive" : "ghost"} size="icon" onClick={handleToggleMic} disabled={!currentTrack}>
                                {isMicOn ? <MicOff /> : <Mic />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <audio ref={audioRef} />

            <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col bg-background/50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3">Playlist</h3>
                    <ScrollArea className="flex-1 bg-muted/30 rounded-md min-h-[200px]">
                        {playlist.length > 0 ? (
                            <ul className="p-2">
                                {playlist.map((track, index) => (
                                    <li key={index} 
                                        className={`p-2 rounded-md cursor-pointer flex items-center gap-2 hover:bg-primary/20 ${index === currentTrackIndex ? 'bg-primary/30 font-bold' : ''}`}
                                        onClick={() => selectTrack(index)}
                                    >
                                        <Music4 className="w-4 h-4 text-muted-foreground"/>
                                        <span className="flex-1 truncate">{track.name}</span>
                                        {track.isAiSuggestion && <span className="text-xs text-accent font-mono">[AI]</span>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Your playlist is empty.
                            </div>
                        )}
                    </ScrollArea>
                </div>
                 <div className="flex flex-col bg-background/50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3">AI Soundtrack Suggester</h3>
                    <form action={suggestionAction} className="space-y-4">
                        <Textarea name="description" placeholder="Describe a mood or theme, e.g., 'upbeat 80s synth for a workout' or 'calm instrumental for studying'." className="min-h-[150px] bg-background" required />
                        <AiSubmitButton />
                    </form>
                </div>
            </div>
        </div>
        <div className="flex flex-col bg-background/50 p-4 rounded-lg border">
             <h3 className="text-lg font-semibold mb-3">Controls</h3>
             <div className="flex flex-col gap-4">
                 <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Upload className="mr-2" />
                    Upload Songs
                </Button>
                <p className="text-xs text-muted-foreground text-center">Upload your own audio files to play.</p>
                <Button onClick={handleInvite} variant="outline" className="w-full">
                    <LinkIcon className="mr-2"/>
                    Get Invite Link
                </Button>
             </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="audio/*"
                multiple
                />
        </div>
      </CardContent>
    </Card>
    </>
  );
}
