
'use client';
import { useState, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Wand2, PartyPopper, Lightbulb, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { getGamePoster } from '@/app/actions';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';

const famousMovies = [
    "Inception", "The Matrix", "Pulp Fiction", "Forrest Gump", "The Godfather",
    "The Dark Knight", "Fight Club", "Star Wars: A New Hope", "Jurassic Park", "Titanic",
    "Avatar", "The Avengers", "Jaws", "E.T. the Extra-Terrestrial", "Back to the Future",
    "The Lord of the Rings: The Fellowship of the Ring", "Finding Nemo", "Toy Story", "The Lion King", "Spirited Away"
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full max-w-sm">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Starting Game...
        </>
      ) : (
        <>
          <Wand2 className="mr-2" />
          Start Random Game
        </>
      )}
    </Button>
  );
}

export default function GamesPage() {
    const { toast } = useToast();
    const [posterUrl, setPosterUrl] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [guess, setGuess] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [gameState, setGameState] = useState<'idle' | 'loading' | 'playing' | 'revealed'>('idle');

    const [state, formAction] = useActionState(getGamePoster, { message: "" });
    
    if (state.message === "success" && state.poster && state.poster.posterDataUri !== posterUrl) {
        setPosterUrl(state.poster.posterDataUri);
        setCorrectAnswer(state.poster.movieTitle);
        setGuess('');
        setShowHint(false);
        setGameState('playing');
        state.message = ""; // Reset message to prevent re-triggering
    }

    const handleStartGame = (formData: FormData) => {
        const randomMovie = famousMovies[Math.floor(Math.random() * famousMovies.length)];
        formData.set('movieTitle', randomMovie);
        setGameState('loading');
        formAction(formData);
    }

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (guess.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
            toast({
                title: 'Correct!',
                description: `You guessed it! The movie was ${correctAnswer}.`,
                className: 'bg-green-500 text-white',
            });
            setGameState('revealed');
        } else {
            toast({
                variant: 'destructive',
                title: 'Incorrect!',
                description: 'That\'s not the one. Try again!',
            });
        }
    }

    const startNewGame = () => {
        setPosterUrl('');
        setCorrectAnswer('');
        setGuess('');
        setShowHint(false);
        setGameState('idle');
    }

    const getHint = () => {
        const vowels = 'aeiou';
        const hint = correctAnswer.split('').map(char => {
            if (char === ' ') return ' ';
            if (vowels.includes(char.toLowerCase())) return char;
            return '_';
        }).join('');
        return hint;
    }

    return (
        <div className="flex min-h-screen w-full" style={{backgroundColor: "hsl(0, 0%, 20%)"}}>
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl mx-auto">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-3">
                                <Gamepad2 /> Guess the Movie!
                            </CardTitle>
                            <CardDescription>
                                The AI will generate a poster for a famous movie without any text. Can you guess what it is?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-6 min-h-[400px]">
                            {gameState === 'idle' && (
                                <form action={handleStartGame} className="w-full flex justify-center">
                                    <SubmitButton />
                                </form>
                            )}
                            
                            {gameState === 'loading' && (
                                 <div className="flex flex-col items-center gap-4 text-center">
                                    <Loader2 className="h-12 w-12 animate-spin" />
                                    <p className="text-muted-foreground">Generating a new movie poster...</p>
                                    <p className="text-sm text-muted-foreground">This can take a few seconds.</p>
                                </div>
                            )}

                           { (gameState === 'playing' || gameState === 'revealed') && posterUrl && (
                                <div className="flex flex-col items-center gap-4 w-full animate-in fade-in-50">
                                    <Image src={posterUrl} alt="AI-generated movie poster" width={400} height={600} className="rounded-lg shadow-lg border-4 border-primary" data-ai-hint="movie poster" />
                                    
                                    {gameState === 'playing' ? (
                                        <form onSubmit={handleGuess} className="w-full max-w-sm space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="guess">Your Guess</Label>
                                                <Input id="guess" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Enter movie title..." required />
                                            </div>
                                            <Button type="submit" className="w-full">Submit Guess</Button>
                                            <Button type="button" variant="outline" className="w-full" onClick={() => setShowHint(!showHint)}>
                                                <Lightbulb className="mr-2" />
                                                {showHint ? 'Hide' : 'Show'} Hint
                                            </Button>
                                            {showHint && (
                                                <div className="p-3 bg-muted rounded-md text-center font-mono tracking-widest text-lg">
                                                    {getHint()}
                                                </div>
                                            )}
                                        </form>
                                    ) : (
                                         <div className="text-center p-4 bg-green-900/50 rounded-lg border border-green-500">
                                            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                                <PartyPopper /> Correct!
                                            </h3>
                                            <p className="text-lg text-muted-foreground">The movie was: <span className="font-bold text-white">{correctAnswer}</span></p>
                                            <Button onClick={startNewGame} className="mt-4">Play Again</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
