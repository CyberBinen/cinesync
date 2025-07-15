'use client';

import type { RecommendFilmOutput } from '@/ai/flows/recommend-film';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Film, Tv, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type RecommendationResultProps = {
  result?: RecommendFilmOutput;
  pending?: boolean;
};

export default function RecommendationResult({ result, pending }: RecommendationResultProps) {
  if (pending) {
    return (
        <div className="bg-background/50 rounded-lg p-6 space-y-4 border border-accent/30 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3">
                    <Skeleton className="w-full h-[450px] rounded-md" />
                </div>
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full mt-1" />
                        <Skeleton className="h-4 w-5/6 mt-1" />
                    </div>
                </div>
            </div>
        </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background/50 rounded-lg border-2 border-dashed border-border p-8 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Your movie recommendation will appear here.</h3>
        <p className="text-muted-foreground">Fill out the form to get a suggestion from our AI expert!</p>
      </div>
    );
  }

  return (
    <div className="bg-background/50 rounded-lg p-6 space-y-4 border border-accent/30 shadow-lg animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-1/3">
           <Image
            src={result.posterDataUri}
            alt={`AI-generated poster for ${result.title}`}
            width={300}
            height={450}
            className="rounded-md object-cover w-full h-auto shadow-md"
            data-ai-hint="movie poster"
          />
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-3xl font-headline font-bold text-accent">{result.title}</h3>
          
          <div className="flex items-center gap-2">
            <Film size={16} className="text-muted-foreground" />
            <Badge variant="secondary">{result.genre}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Tv size={16} className="text-muted-foreground" />
            <p className="font-medium">Available on: <span className="font-bold text-foreground">{result.streamingService}</span></p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-1">Description</h4>
            <p className="text-muted-foreground text-sm">
              {result.shortDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
