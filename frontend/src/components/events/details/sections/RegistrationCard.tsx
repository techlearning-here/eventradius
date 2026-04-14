import React from 'react';
import { Event } from '../types';
import { EventParticipation } from '../../EventParticipation';

interface RegistrationCardProps {
  event: Event;
  isRegistered: boolean;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ event, isRegistered }) => {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-foreground mb-4">
        {event.is_paid_event ? 'Purchase Tickets' : 'Register for Free'}
      </h3>
      
      {/* Free Event Highlight */}
      {!event.is_paid_event && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-600">Free Event</div>
              <div className="text-sm text-muted-foreground">No registration fee required</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Paid Event Ticketing */}
      {event.is_paid_event && (
        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-amber-600">Paid Event</div>
              <div className="text-sm text-muted-foreground">Tickets available for purchase</div>
            </div>
          </div>
          {event.ticket_pricing_description && (
            <p className="text-sm text-muted-foreground mb-3">{event.ticket_pricing_description}</p>
          )}
        </div>
      )}
      
      <EventParticipation eventId={event.id} />
      
      {/* External Ticketing Links for Paid Events */}
      {event.is_paid_event && (
        <div className="mt-4 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Purchase Tickets
          </button>
          {event.ticketing_website && (
            <a 
              href={event.ticketing_website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 p-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit Ticketing Site
            </a>
          )}
        </div>
      )}
      
      {event.max_participants && (
        <div className="mt-4 p-3 bg-background/50 rounded-xl border border-border/50">
          <div className="flex justify-between items-center text-muted-foreground text-sm mb-2">
            <span>Spots Available</span>
            <span className="font-semibold text-foreground">{event.max_participants - (event.current_participants || 0)}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${((event.current_participants || 0) / event.max_participants) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationCard;
