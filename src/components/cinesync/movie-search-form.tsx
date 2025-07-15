'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        <>
            <Search className="mr-2" />
            Search
        </>
      )}
    </Button>
  );
}

type MovieSearchFormProps = {
  formAction: (prevState: any, formData: FormData) => Promise<any>;
};

export default function MovieSearchForm({ formAction }: MovieSearchFormProps) {
    const [state, action] = useActionState(formAction, { message: "", recommendation: undefined, error: undefined });

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="movieTitle" className="text-lg">
          Movie Title
        </Label>
        <Input
          id="movieTitle"
          name="movieTitle"
          placeholder="e.g., Inception"
          className="bg-background"
          required
        />
        <p className="text-sm text-muted-foreground">Enter the title of the movie you want to find.</p>
      </div>
      <SubmitButton />
    </form>
  );
}
