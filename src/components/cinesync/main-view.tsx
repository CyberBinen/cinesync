
'use client';

import React from 'react';
import VideoPlayer from '@/components/cinesync/video-player';

interface MainViewProps {
  movieTitle?: string;
  partyId?: string;
}

export default function MainView({ movieTitle, partyId }: MainViewProps) {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-8">
      <VideoPlayer movieTitle={movieTitle} partyId={partyId} />
    </div>
  );
}
