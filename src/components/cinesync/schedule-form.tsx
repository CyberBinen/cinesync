'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Film, Ghost, Rocket, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface ScheduledParty {
  id: string;
  movieTitle: string;
  date: string;
  theme: string;
}

export default function ScheduleForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [theme, setTheme] = useState('default');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const movieTitle = formData.get('movieTitle') as string;
    const scheduleTime = formData.get('scheduleTime') as string;
    
    // In a real app, you would save this to a database and get a unique ID.
    // For this prototype, we'll generate a random-ish ID.
    const partyId = Math.random().toString(36).substring(2, 9);
    
    // We'll store the title in localStorage to pass it to the watch page.
    localStorage.setItem(`party-${partyId}-title`, movieTitle);

    // Save the full party details to our list in localStorage
    const newParty: ScheduledParty = {
      id: partyId,
      movieTitle,
      date: scheduleTime,
      theme,
    };

    const existingParties = JSON.parse(localStorage.getItem('scheduledParties') || '[]') as ScheduledParty[];
    localStorage.setItem('scheduledParties', JSON.stringify([...existingParties, newParty]));

    toast({
        title: 'Watch Party Scheduled!',
        description: `"${movieTitle}" has been added to your list.`,
    });
    
    router.push(`/schedule/list`);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Create Watch Party</CardTitle>
          <CardDescription>Give your party a name, schedule it, and choose a theme!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="movieTitle">Movie Title</Label>
            <Input id="movieTitle" name="movieTitle" placeholder="e.g., The Matrix" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduleTime">Date & Time</Label>
            <Input id="scheduleTime" name="scheduleTime" type="datetime-local" required defaultValue={new Date().toISOString().substring(0, 16)} />
          </div>
           <div className="space-y-3">
            <Label>Choose a Theme (Optional)</Label>
            <RadioGroup defaultValue="default" value={theme} onValueChange={setTheme} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="default" id="default" className="peer sr-only" />
                <Label htmlFor="default" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Film className="mb-3 h-6 w-6" />
                  Default
                </Label>
              </div>
               <div>
                <RadioGroupItem value="horror" id="horror" className="peer sr-only" />
                <Label htmlFor="horror" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Ghost className="mb-3 h-6 w-6" />
                  Horror
                </Label>
              </div>
              <div>
                <RadioGroupItem value="scifi" id="scifi" className="peer sr-only" />
                <Label htmlFor="scifi" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Rocket className="mb-3 h-6 w-6" />
                  Sci-Fi
                </Label>
              </div>
              <div>
                <RadioGroupItem value="comedy" id="comedy" className="peer sr-only" />
                <Label htmlFor="comedy" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                  <Smile className="mb-3 h-6 w-6" />
                  Comedy
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Schedule Party
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
