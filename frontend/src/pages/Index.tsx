import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventDetailOverlay } from '@/components/events/details/EventDetailPage';

const Index = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOverlayOpen, setIsOverlayOpen] = useState(true);

  const handleClose = () => {
    setIsOverlayOpen(false);
    // Navigate to public discover page when overlay is closed (for shared links)
    navigate('/discover-nosignup');
  };

  return (
    <>
      <EventDetailOverlay eventId={id || ''} isOpen={isOverlayOpen} onClose={handleClose} />
    </>
  );
};

export default Index;
