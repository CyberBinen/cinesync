'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Recommending...
        </>
      ) : (
        'Get Recommendation'
      )}
    </Button>
  );
}

type RecommendationFormProps = {
  formAction: (prevState: any, formData: FormData) => Promise<any>;
};

export default function RecommendationForm({ formAction }: RecommendationFormProps) {
  const [state, action] = useActionState(formAction, { message: "", recommendation: undefined, error: undefined });
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="viewingHistory" className="text-lg">
          Viewing History
        </Label>
        <Textarea
          id="viewingHistory"
          name="viewingHistory"
          placeholder="e.g., I love sci-fi movies from the 80s like Blade Runner, anything by Christopher Nolan, and recently enjoyed comedies like 'Booksmart'."
          className="min-h-[120px] bg-background"
          required
        />
        <p className="text-sm text-muted-foreground">Describe films, genres, directors, or actors you've enjoyed.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferences" className="text-lg">
          Current Preferences
        </Label>
        <Textarea
          id="preferences"
          name="preferences"
          placeholder="e.g., I'm in the mood for a thought-provoking thriller that will keep me on the edge of my seat."
          className="min-h-[120px] bg-background"
          required
        />
        <p className="text-sm text-muted-foreground">What kind of movie do you feel like watching now?</p>
      </div>
      <SubmitButton />
    </form>
  );
}
