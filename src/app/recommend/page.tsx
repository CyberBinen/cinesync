'use client';

import React, { useState, useTransition } from 'react';
import RecommendationForm from '@/components/cinesync/recommendation-form';
import RecommendationResult from '@/components/cinesync/recommendation-result';
import type { RecommendFilmOutput } from '@/ai/flows/recommend-film';
import { getFilmRecommendation, searchForFilm } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clapperboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MovieSearchForm from '@/components/cinesync/movie-search-form';


export default function RecommendPage() {
  const [recommendation, setRecommendation] = useState<RecommendFilmOutput | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const handleRecommendation = async (prevState: any, formData: FormData) => {
    startTransition(async () => {
      const result = await getFilmRecommendation(prevState, formData);
      if(result.recommendation) {
          setRecommendation(result.recommendation);
      }
      // You might want to handle errors here, e.g. show a toast
    });
    return { message: "pending" };
  }

  const handleSearch = async (prevState: any, formData: FormData) => {
    startTransition(async () => {
        const result = await searchForFilm(prevState, formData);
        if(result.recommendation) {
            setRecommendation(result.recommendation);
        }
        // You might want to handle errors here, e.g. show a toast
    });
    return { message: "pending" };
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-800" style={{backgroundColor: "hsl(0, 0%, 20%)"}}>
       <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl mx-auto">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                <Clapperboard className="w-8 h-8 text-accent" />
                <div>
                    <CardTitle className="font-headline text-2xl">Find Your Next Movie</CardTitle>
                    <CardDescription>Let our AI recommend a film, or search for one you have in mind.</CardDescription>
                </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div>
                        <Tabs defaultValue="recommend">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="recommend">AI Recommendation</TabsTrigger>
                                <TabsTrigger value="search">Search Movie</TabsTrigger>
                            </TabsList>
                            <TabsContent value="recommend">
                                <Card>
                                    <CardContent className="pt-6">
                                        <RecommendationForm formAction={handleRecommendation} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="search">
                                <Card>
                                    <CardContent className="pt-6">
                                        <MovieSearchForm formAction={handleSearch} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <RecommendationResult result={recommendation} pending={isPending} />
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
