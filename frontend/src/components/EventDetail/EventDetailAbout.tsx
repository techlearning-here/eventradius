import React from 'react';

interface EventDetailAboutProps {
  description?: string;
}

export const EventDetailAbout: React.FC<EventDetailAboutProps> = ({ description }) => {
  if (!description) return null;
  
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        About This Event
      </h2>
      <div className="prose prose-lg max-w-none">
        {description.split('\n').map((paragraph, index) => (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4 text-base">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
};

export default EventDetailAbout;
