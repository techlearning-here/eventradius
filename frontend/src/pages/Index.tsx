import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EventDetailOverlay } from '@/components/EventDetailPage';

const Index = () => {
  const { id } = useParams();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  return (
    <>
      <EventDetailOverlay eventId={id || ''} isOpen={isOverlayOpen} onClose={() => setIsOverlayOpen(false)} />
    </>
  );
};

export default Index;
