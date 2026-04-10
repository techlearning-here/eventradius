import React from 'react';
import { Info, FileText, Quote } from 'lucide-react';

interface EventDetailAboutProps {
  description?: string;
}

export const EventDetailAbout: React.FC<EventDetailAboutProps> = ({ description }) => {
  if (!description) return null;
  
  const paragraphs = description.split('\n').filter(p => p.trim());
  
  return (
    <section className="relative">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">About This Event</h2>
          <p className="text-sm text-muted-foreground">Everything you need to know</p>
        </div>
      </div>
      
      {/* Description Content */}
      <div className="relative bg-gradient-to-br from-card/50 to-transparent rounded-2xl border border-border/50 p-6 md:p-8">
        {/* Quote decoration */}
        <div className="absolute top-4 right-4 opacity-10">
          <Quote className="w-12 h-12 text-primary" />
        </div>
        
        <div className="relative space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className="text-muted-foreground leading-relaxed text-base md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Bottom info hint */}
        <div className="mt-6 pt-4 border-t border-border/30 flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4 text-primary/60" />
          <span>Read all details before registering</span>
        </div>
      </div>
    </section>
  );
};

export default EventDetailAbout;
