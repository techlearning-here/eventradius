import React, { useEffect } from 'react';
import { Calendar, MapPin, Users, Ticket, UserCheck, List } from 'lucide-react';
import { Event } from '../types';

interface QuickInfoBarProps {
  event: Event;
}

export const QuickInfoBar: React.FC<QuickInfoBarProps> = ({ event }) => {
  // Debug log for quick info fields
  useEffect(() => {
    console.log('[QuickInfoBar] Debug - Quick info fields:', {
      date: event.date,
      start_time: event.start_time,
      timezone: event.timezone,
      location: event.location,
      address: event.address,
      current_participants: event.current_participants,
      max_participants: event.max_participants,
      category: event.category,
      is_public: event.is_public,
      ticket_price: event.ticket_price,
      require_approval: event.require_approval,
      enable_waitlist: event.enable_waitlist,
    });
  }, [event.date, event.start_time, event.timezone, event.location, event.address, 
      event.current_participants, event.max_participants, event.category, event.is_public,
      event.ticket_price, event.require_approval, event.enable_waitlist]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Date</div>
        <div className="text-lg text-muted-foreground">
          {event.date || new Date(event.start_time || event.created_at).toLocaleDateString()}
        </div>
        {event.timezone && (
          <div className="text-xs text-muted-foreground mt-1">{event.timezone}</div>
        )}
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Location</div>
        <div className="text-lg text-muted-foreground">
          {event.location || event.address}
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Users className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Attendees & Category</div>
        <div className="text-lg text-muted-foreground">
          {event.current_participants || 0} / {event.max_participants || 'Unlimited'}
          {event.enable_waitlist && event.max_participants && (
            <span className="ml-2 text-xs text-amber-600">(Waitlist Enabled)</span>
          )}
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          {event.category || 'Event'} • {event.is_public ? 'Public' : 'Private'}
        </div>
      </div>

      {/* Ticket Price */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <Ticket className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Ticket Price</div>
        <div className="text-lg text-muted-foreground">
          {(event.ticket_price ?? 0) > 0 ? `$${event.ticket_price}` : 'Free'}
        </div>
      </div>

      {/* Require Approval */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
        <UserCheck className="w-6 h-6 text-primary mx-auto mb-2" />
        <div className="text-sm font-semibold text-foreground mb-1">Approval</div>
        <div className="text-lg text-muted-foreground">
          {event.require_approval ? 'Required' : 'Auto-Approve'}
        </div>
      </div>

      {/* Waitlist */}
      {event.max_participants && event.enable_waitlist && (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-4 text-center">
          <List className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <div className="text-sm font-semibold text-foreground mb-1">Waitlist</div>
          <div className="text-lg text-amber-700">Enabled</div>
          <div className="text-xs text-amber-600 mt-1">Full? Join the waitlist!</div>
        </div>
      )}
    </div>
  );
};

export default QuickInfoBar;
