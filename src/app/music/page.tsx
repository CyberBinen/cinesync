import { MusicPlayer } from '@/components/cinesync/music-player';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MusicPage() {
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
                <MusicPlayer />
            </div>
        </main>
    </div>
  );
}
