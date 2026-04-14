import React, { useEffect } from 'react';
import { Event } from '../types';

interface AboutSectionProps {
  event: Event;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ event }) => {
  // Debug log for new fields
  useEffect(() => {
    console.log('[AboutSection] Debug - New fields:', {
      subtitle: event.subtitle,
      summary: event.summary,
      hasDescription: !!event.description,
      descriptionLength: event.description?.length || 0,
    });
  }, [event.subtitle, event.summary, event.description]);

  if (!event.description && !event.subtitle && !event.summary) {
    console.log('[AboutSection] No content to display - returning null');
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        About This Event
      </h2>
      {event.subtitle && (
        <p className="text-lg text-foreground font-medium mb-4">{event.subtitle}</p>
      )}
      {event.summary && (
        <p className="text-base text-muted-foreground mb-6 italic">{event.summary}</p>
      )}
      <div className="prose prose-lg max-w-none">
        {event.description?.split('\n').map((paragraph, index) => (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4 text-base">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
};

export default AboutSection;
