import { Button } from '@/components/ui/button';
import { Clapperboard, Music, Sparkles, Tv, Gamepad2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center">
      <Image
        src="https://images.unsplash.com/photo-1574267432553-4b4628081c31"
        alt="A cozy, modern living room with a large screen, set up for a movie night"
        fill
        className="object-cover brightness-50"
        data-ai-hint="movie night living room"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
      <main className="relative z-10 flex flex-col items-center justify-center p-4 text-center text-white">
        <div className="flex flex-col items-center justify-center">
          <Clapperboard className="h-16 w-16 text-primary mb-4" />
          <h1 className="text-5xl font-headline font-bold text-foreground drop-shadow-lg">
            CineSync
          </h1>
          <p className="text-muted-foreground mt-2 text-lg drop-shadow-md">
            Your place for synchronized movie nights, shared music, and fun games from anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <Button asChild size="lg">
              <Link href="/schedule/list">
                <Tv className="mr-2" />
                View Watch Parties
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
                <Link href="/music">
                    <Music className="mr-2"/>
                    Start a Music Session
                </Link>
            </Button>
             <Button asChild variant="outline" size="lg" className="bg-background/20 border-white/20 hover:bg-white/10">
              <Link href="/recommend">
                <Sparkles className="mr-2" />
                Get Movie Ideas
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-background/20 border-white/20 hover:bg-white/10">
              <Link href="/games">
                <Gamepad2 className="mr-2" />
                Play a Game
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
