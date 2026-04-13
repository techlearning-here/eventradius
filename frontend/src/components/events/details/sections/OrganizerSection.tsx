import React from 'react';
import { Users } from 'lucide-react';
import { Event, OrganizerProfile } from '../types';

interface OrganizerSectionProps {
  event: Event;
  organizerProfile: OrganizerProfile | null;
}

export const OrganizerSection: React.FC<OrganizerSectionProps> = ({ event, organizerProfile }) => {
  const displayName = organizerProfile?.business_name || organizerProfile?.full_name || 
                      event.creator || 'Event Organizer';

  const hasContactInfo = event.event_contact_phone || event.event_contact_email || 
                         event.organizer_email || event.organizer_website;

  if (!hasContactInfo && !organizerProfile) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Event Organizer
      </h2>
      <div className="bg-gradient-to-br from-card to-background border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{displayName}</h3>
            <p className="text-muted-foreground">Event Host</p>
            {organizerProfile?.email && (
              <a href={`mailto:${organizerProfile.email}`} className="text-sm text-primary hover:underline mt-1 block">
                {organizerProfile.email}
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Contact Phone from ContactInfo step */}
          {event.event_contact_phone && (
            <a 
              href={`tel:${event.event_contact_phone_country_code || ''}${event.event_contact_phone}`}
              className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Event Phone</p>
                <p className="font-semibold text-gray-900">
                  {event.event_contact_phone_country_code || ''} {event.event_contact_phone}
                </p>
              </div>
            </a>
          )}
          
          {/* Event Contact Email from ContactInfo step */}
          {event.event_contact_email && (
            <a 
              href={`mailto:${event.event_contact_email}`}
              className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Event Email</p>
                <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{event.event_contact_email}</p>
              </div>
            </a>
          )}
          
          {/* Organizer Email (fallback) */}
          {!event.event_contact_email && event.organizer_email && (
            <a 
              href={`mailto:${event.organizer_email}`}
              className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Organizer Email</p>
                <p className="font-semibold text-gray-900 text-sm truncate max-w-[180px]">{event.organizer_email}</p>
              </div>
            </a>
          )}
          
          {/* Organizer Website */}
          {event.organizer_website && (
            <a 
              href={event.organizer_website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Website</p>
                <p className="font-semibold text-gray-900 text-sm">{new URL(event.organizer_website).hostname.replace('www.', '')}</p>
              </div>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrganizerSection;
