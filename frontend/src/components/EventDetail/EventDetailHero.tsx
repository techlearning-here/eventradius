import React from 'react';

interface EventDetailHeroProps {
  background_image_url?: string;
  event_type?: string;
  is_public?: boolean;
  loading?: boolean;
}

export const EventDetailHero: React.FC<EventDetailHeroProps> = ({ 
  background_image_url, 
  event_type, 
  is_public,
  loading = false 
}) => {
  return (
    <div className="relative h-80 md:h-96 overflow-hidden">
      {/* Loading State for Hero Image */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 animate-pulse z-10">
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-lg">Loading...</div>
          </div>
        </div>
      )}
      
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105 transition-all duration-700"
        style={{ 
          backgroundImage: background_image_url 
            ? `url("${background_image_url}")` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      
      {/* Hero Content Container - Transparent */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="w-full">
          <div className="p-8">
            <div className="max-w-3xl">
              {/* Event Type Badge */}
              {event_type && (
                <span className="inline-block px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-sm font-semibold rounded-full mb-4 border border-white/30 shadow-lg">
                  {event_type === 'in_person' ? 'In Person Event' : event_type}
                </span>
              )}
              
              {is_public && (
                <span className="px-4 py-2 bg-white/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/50 shadow-lg ml-4">
                  Public Event
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailHero;
