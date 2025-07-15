'use client';

import React, { useState, useEffect, useRef, useActionState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clapperboard, Send, Users, MessageSquareQuote, Loader2, Bot, SmilePlus, Mic, MicOff } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { getChatSummary, getTriviaAnswer } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';


interface Message {
  user: string;
  avatar: string;
  aiHint: string;
  text: string;
  time: string;
  isYou?: boolean;
  isBot?: boolean;
}

const initialMessages: Message[] = [
  {
    user: 'Alex',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'man face',
    text: 'This opening scene is iconic!',
    time: '5:01 PM',
  },
  {
    user: 'Maria',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'woman face',
    text: 'I know, right? The cinematography is breathtaking. 😮',
    time: '5:02 PM',
  },
  {
    user: 'David',
    avatar: 'https://placehold.co/40x40.png',
    aiHint: 'person face',
    text: 'Just joined! Did I miss anything important?',
    time: '5:03 PM',
  },
];

const SummaryButton = () => {
  const { pending } = useFormStatus();
  return (
     <Button variant="outline" size="sm" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        <>
          <MessageSquareQuote className="mr-2 h-4 w-4" />
          Summarize Chat
        </>
      )}
    </Button>
  )
}

const SendButton = () => {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 text-accent hover:text-accent"
            disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} />}
        </Button>
    )
}

export default function ChatSidebar({ movieTitle }: { movieTitle: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [summary, setSummary] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuestionInput(transcript);
            setIsListening(false);
        };
        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            toast({ variant: 'destructive', title: 'Voice Error', description: `An error occurred during speech recognition: ${event.error}` });
            setIsListening(false);
        };
        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }
  }, [toast]);


  useEffect(() => {
    const handleDiscussionStarters = (event: Event) => {
        const customEvent = event as CustomEvent<string[]>;
        const questions = customEvent.detail;
        
        const botMessage: Message = {
          user: 'CineSync Bot',
          avatar: 'https://placehold.co/40x40.png',
          aiHint: 'robot face',
          text: `That was a great movie! Here are some questions to get the discussion going:\n- ${questions.join('\n- ')}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBot: true,
        };
        setMessages(prev => [...prev, botMessage]);
    };

    window.addEventListener('discussion-starters', handleDiscussionStarters);
    return () => {
        window.removeEventListener('discussion-starters', handleDiscussionStarters);
    };
  }, []);

  // Chat Summary Action
  const [summaryState, summaryAction] = useActionState(getChatSummary, { summary: undefined, error: undefined });
  useEffect(() => {
    if(summaryState?.summary) {
        setSummary(summaryState.summary);
    }
    if(summaryState?.error) {
        toast({ variant: 'destructive', title: 'Error', description: summaryState.error });
    }
  }, [summaryState, toast]);

  // Trivia/Chatbot Action
  const [triviaState, triviaAction] = useActionState(getTriviaAnswer, { answer: undefined, error: undefined });
  useEffect(() => {
    if (triviaState?.answer) {
      setMessages(prev => [...prev, {
          user: 'CineSync Bot',
          avatar: 'https://placehold.co/40x40.png',
          aiHint: 'robot face',
          text: triviaState.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBot: true,
      }]);
    }
    if (triviaState?.error) {
        toast({ variant: 'destructive', title: 'Error', description: triviaState.error });
    }
  }, [triviaState, toast]);

  const handleTriviaSubmit = (formData: FormData) => {
    const question = formData.get('question') as string;
    if (!question) return;

    const userMessage: Message = {
      user: 'You',
      avatar: 'https://placehold.co/40x40.png',
      aiHint: 'user icon',
      text: question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isYou: true,
    };
    setMessages(prev => [...prev, userMessage]);

    const triviaFormData = new FormData();
    triviaFormData.append('movieTitle', movieTitle);
    triviaFormData.append('question', question);
    
    triviaAction(triviaFormData);
    setQuestionInput('');
  }
  
  const handleEmojiClick = (emoji: string) => {
    const event = new CustomEvent('emoji-reaction', { detail: emoji });
    window.dispatchEvent(event);
  };
  
  const handleVoiceInput = () => {
    if (recognitionRef.current) {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    } else {
        toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Your browser does not support speech recognition.' });
    }
  };

  const chatHistoryForSummary = messages.map(m => `${m.user}: ${m.text}`).join('\n');

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-card flex flex-col h-screen border-l border-border">
      <header className="p-4 flex flex-col gap-2 items-center justify-center border-b">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-foreground">
            CineSync
          </h1>
        </div>
        <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={16} />
                <span>14 Viewers</span>
            </div>
            <form action={summaryAction}>
                <input type="hidden" name="chatHistory" value={chatHistoryForSummary} />
                <SummaryButton />
            </form>
        </div>
      </header>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
            {summary && (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertTitle>Chat Summary</AlertTitle>
                <AlertDescription>{summary}</AlertDescription>
              </Alert>
            )}
          {messages.map((msg, index) => (
             <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.isYou ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.avatar} data-ai-hint={msg.aiHint} />
                <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${
                  msg.isYou ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-xs ${
                    msg.isYou
                      ? 'bg-primary text-primary-foreground'
                      : msg.isBot
                      ? 'bg-accent/20 border border-accent/50'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm font-bold">{msg.user}</p>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
                 <span className="text-xs text-muted-foreground mt-1">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <Separator />

      <footer className="p-4">
        <form action={handleTriviaSubmit} ref={formRef}>
          <div className="relative">
            <Input
              name="question"
              placeholder="Ask the AI about the movie..."
              className="pr-28"
              required
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
            />
            <div className="absolute top-1/2 right-10 -translate-y-1/2 flex items-center">
                 <Button type="button" size="icon" variant="ghost" className={`h-8 w-8 text-muted-foreground hover:text-accent ${isListening ? 'text-red-500' : ''}`} onClick={handleVoiceInput}>
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent">
                            <SmilePlus size={20} />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="flex gap-1">
                            {['👍', '😂', '😍', '🤯', '🍿'].map(emoji => (
                                <Button key={emoji} variant="ghost" size="icon" onClick={() => handleEmojiClick(emoji)} className="text-2xl">
                                    {emoji}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <SendButton />
          </div>
        </form>
      </footer>
    </aside>
  );
}
