import ScheduleForm from '@/components/cinesync/schedule-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
  return (
    <div className="flex h-screen w-full bg-slate-800" style={{backgroundColor: "hsl(0, 0%, 20%)"}}>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/schedule/list">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Scheduled Parties
                </Link>
            </Button>
           <ScheduleForm />
        </div>
      </main>
    </div>
  );
}
