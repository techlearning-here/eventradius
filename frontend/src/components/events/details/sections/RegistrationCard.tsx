import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { EventParticipation } from '../../EventParticipation';
import { apiClient } from '@/integrations/backend/api';
import { Tag, Clock, Ticket } from 'lucide-react';

interface RegistrationCardProps {
  event: Event;
  isRegistered: boolean;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ event, isRegistered }) => {
  const [dealInfo, setDealInfo] = useState<{
    has_active_deal: boolean;
    discount_percent?: number;
    discount_amount?: number;
    original_price?: number;
    discounted_price?: number;
    seats_remaining?: number;
    valid_until?: string;
    code?: string;
  } | null>(null);

  // Fetch deal info for paid events
  useEffect(() => {
    if (event.is_paid_event && event.id) {
      apiClient.getEventDeal(event.id)
        .then(info => {
          if (info.has_active_deal) {
            setDealInfo(info);
          }
        })
        .catch(() => {
          // No deal available
        });
    }
  }, [event.id, event.is_paid_event]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

      {/* Active Discount Deal */}
      {event.is_paid_event && dealInfo?.has_active_deal && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-400/30 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
              <Tag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-red-600 text-lg">{dealInfo.discount_percent}% OFF</div>
              <div className="text-sm text-red-500/80 font-medium">Limited time offer!</div>
            </div>
          </div>

          {/* Price Comparison */}
          <div className="flex items-center gap-4 mb-3 p-3 bg-white/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground line-through">{formatPrice(dealInfo.original_price)}</div>
              <div className="text-xs text-muted-foreground">Original</div>
            </div>
            <div className="text-2xl font-bold text-red-600">{formatPrice(dealInfo.discounted_price)}</div>
            <div className="text-sm text-green-600 font-medium">Save {formatPrice((dealInfo.original_price || 0) - (dealInfo.discounted_price || 0))}!</div>
          </div>

          {/* Coupon Code */}
          {dealInfo.code && (
            <div className="mb-3 p-3 bg-white/80 rounded-lg border-2 border-dashed border-red-300">
              <div className="text-xs text-muted-foreground mb-1">Use code at checkout:</div>
              <div className="flex items-center gap-2">
                <code className="text-lg font-mono font-bold text-red-600 bg-red-50 px-3 py-1 rounded">
                  {dealInfo.code}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(dealInfo.code!)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Deal Details */}
          <div className="space-y-2 text-sm">
            {dealInfo.valid_until && (
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span>Offer ends: {formatDate(dealInfo.valid_until)}</span>
              </div>
            )}
            {dealInfo.seats_remaining !== undefined && dealInfo.seats_remaining > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <Ticket className="w-4 h-4" />
                <span>Only {dealInfo.seats_remaining} discounted tickets left!</span>
              </div>
            )}
          </div>

          {/* Claim Button */}
          <button className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-red-500/25">
            <Tag className="w-5 h-5" />
            {event.ticketing_website ? 'Claim Discount & Purchase' : 'Claim Discount - Pay at Venue'}
          </button>
        </div>
      )}

      {/* Paid Event Ticketing - No Deal */}
      {event.is_paid_event && !dealInfo?.has_active_deal && (
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
      
      <EventParticipation event={event} />
      
      {/* External Ticketing Links for Paid Events */}
      {event.is_paid_event && (
        <div className="mt-4 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {event.ticketing_website ? 'Purchase Tickets' : 'Pay at Venue'}
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
