
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ChatSidebar from '@/components/cinesync/chat-sidebar';
import MainView from '@/components/cinesync/main-view';
import ParticipantsPanel from '@/components/cinesync/participants-panel';

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const id = params.id as string;

  const [movieTitle, setMovieTitle] = useState('Loading movie...');

  useEffect(() => {
    // In a real app, you'd fetch schedule details from a database using the ID.
    // For this prototype, we're retrieving it from localStorage.
    if (typeof window !== 'undefined' && id) {
      const storedTitle = localStorage.getItem(`party-${id}-title`);
      setMovieTitle(storedTitle || `Watch Party ${id}`);
    }
  }, [id]);

  const themeBackgrounds: { [key: string]: string } = {
    horror: 'https://placehold.co/1920x1080/000000/ffffff.png?text=Horror',
    scifi: 'https://placehold.co/1920x1080/0c0c2c/ffffff.png?text=Sci-Fi',
    comedy: 'https://placehold.co/1920x1080/fff8e1/000000.png?text=Comedy',
  }
  
  const backgroundStyle = theme && themeBackgrounds[theme] ? {
    backgroundImage: `url('${themeBackgrounds[theme]}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {
    backgroundColor: "hsl(0, 0%, 20%)"
  };

  return (
    <div className="flex h-screen w-full bg-slate-800" style={backgroundStyle}>
      <main className="flex-1 flex flex-col overflow-y-auto bg-black/50 backdrop-blur-sm">
        <MainView movieTitle={movieTitle} partyId={id} />
        <ParticipantsPanel />
      </main>
      <ChatSidebar movieTitle={movieTitle}/>
    </div>
  );
}
