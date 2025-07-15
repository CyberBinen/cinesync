'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Video, Calendar, Users, Ghost, Rocket, Smile, Film } from 'lucide-react';
import Link from 'next/link';
import { type ScheduledParty } from '@/components/cinesync/schedule-form';
import { format } from 'date-fns';

const themeIcons: { [key: string]: React.ElementType } = {
  default: Film,
  horror: Ghost,
  scifi: Rocket,
  comedy: Smile,
};

export default function ScheduledListPage() {
  const [parties, setParties] = useState<ScheduledParty[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedParties = localStorage.getItem('scheduledParties');
      if (storedParties) {
        // Sort parties by date, most recent first
        const parsedParties = JSON.parse(storedParties) as ScheduledParty[];
        const sortedParties = parsedParties.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setParties(sortedParties);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full" style={{backgroundColor: "hsl(0, 0%, 20%)"}}>
      <main className="flex-1 flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
             <Button variant="ghost" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
            <Button asChild>
              <Link href="/schedule/new">
                <PlusCircle className="mr-2" />
                Schedule New Party
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-3"><Video /> Your Scheduled Watch Parties</CardTitle>
                <CardDescription>Here are all the movie nights you have planned. Click one to join the party!</CardDescription>
            </CardHeader>
            <CardContent>
                {parties.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {parties.map(party => {
                            const Icon = themeIcons[party.theme] || Film;
                            return (
                                <Card key={party.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="flex items-start gap-3">
                                          <Icon className="w-6 h-6 mt-1 text-accent flex-shrink-0" />
                                          <span className="flex-1">{party.movieTitle}</span>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 pt-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{format(new Date(party.date), "EEE, MMM d, yyyy 'at' h:mm a")}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>Party ID: {party.id}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full">
                                            <Link href={`/watch/${party.id}?theme=${party.theme}`}>
                                                Join Watch Party
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-semibold">No Parties Scheduled Yet</h3>
                        <p className="text-muted-foreground mt-2">Click the button above to schedule your first watch party!</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
