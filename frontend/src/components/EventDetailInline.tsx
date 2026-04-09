import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/integrations/backend/api';
import { getDummyEvent, isDummyEvent } from './EventDetail/data/dummyEvents';
import type { Event } from '@/integrations/backend/api';
import { 
  Users, Accessibility, Globe, GraduationCap, AlertCircle, 
  Calendar, MapPin, Users2, Clock, Tag, CheckCircle2,
  Utensils, BookOpen, Volume2, Wine, Cigarette, Dumbbell,
  Briefcase, PartyPopper, Heart, Baby, Sparkles, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface EventDetailInlineProps {
  eventId: string;
  isDeleted?: boolean;
  onClose: () => void;
}

export const EventDetailInline: React.FC<EventDetailInlineProps> = ({ eventId, isDeleted = false, onClose }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    try {
      let data;
      
      if (isDummyEvent(eventId)) {
        data = getDummyEvent(eventId);
      } else if (isDeleted) {
        data = await apiClient.getDeletedEvent(eventId);
      } else {
        data = await apiClient.getEvent(eventId);
      }

      if (data) {
        setEvent(data);
        setError(null);
      } else {
        setEvent(null);
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId, isDeleted]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-medium mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-8">{error || 'Event not found'}</p>
        <button 
          onClick={onClose} 
          className="px-6 py-3 bg-foreground text-background border border-foreground hover:opacity-90 transition-colors uppercase text-sm font-medium rounded-lg"
        >
          Close
        </button>
      </div>
    );
  }

  // Helper function to format snake_case to readable text
  const formatLabel = (text: string | null | undefined) => {
    if (!text) return '';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Section component for consistent styling
  const Section = ({ icon: Icon, title, children, color = "bg-primary" }: { 
    icon: React.ElementType; 
    title: string; 
    children: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-card rounded-xl p-5 border border-border/50 hover:border-border/80 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${color} p-2.5 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  // Info item component
  const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <span className="text-sm text-muted-foreground sm:w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <div className="bg-background rounded-lg max-h-[80vh] overflow-y-auto">
      {/* Event Hero */}
      <div className="relative h-56 overflow-hidden rounded-t-lg">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/30 to-primary/50 flex items-center justify-center">
            <span className="text-6xl">🎉</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
          {event.category && (
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              {event.category}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Event Content */}
      <div className="p-6 space-y-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {event.start_time && (
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center text-center">
              <Calendar className="w-5 h-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">Date</span>
              <span className="text-sm font-medium">
                {new Date(event.start_time).toLocaleDateString()}
              </span>
            </div>
          )}
          {event.location && (
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center text-center">
              <MapPin className="w-5 h-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">Location</span>
              <span className="text-sm font-medium truncate w-full">{event.location}</span>
            </div>
          )}
          {event.max_participants && (
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center text-center">
              <Users2 className="w-5 h-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">Capacity</span>
              <span className="text-sm font-medium">
                {event.current_participants || 0} / {event.max_participants}
              </span>
            </div>
          )}
          {event.content_rating && (
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center text-center">
              <AlertCircle className="w-5 h-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">Rating</span>
              <span className="text-sm font-medium">{formatLabel(event.content_rating)}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              About this event
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Attributes Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Audience & Demographics */}
          <Section icon={Users} title="Audience & Demographics" color="bg-blue-500">
            {event.age_categories && event.age_categories.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground block mb-2">Age Groups</span>
                <div className="flex flex-wrap gap-1.5">
                  {event.age_categories.map((age, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {formatLabel(age)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {event.gender_preference && event.gender_preference !== 'all' && (
              <InfoItem label="Gender" value={formatLabel(event.gender_preference)} />
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {event.family_friendly && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  <Baby className="w-3 h-3 mr-1" /> Family Friendly
                </Badge>
              )}
              {event.senior_friendly && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <Heart className="w-3 h-3 mr-1" /> Senior Friendly
                </Badge>
              )}
              {event.singles_friendly && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <Users className="w-3 h-3 mr-1" /> Singles Welcome
                </Badge>
              )}
              {event.couples_oriented && (
                <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200">
                  <Heart className="w-3 h-3 mr-1" /> Couples
                </Badge>
              )}
            </div>
          </Section>

          {/* Accessibility */}
          <Section icon={Accessibility} title="Accessibility" color="bg-teal-500">
            <div className="flex flex-wrap gap-2">
              {event.wheelchair_accessible && (
                <Badge className="bg-green-100 text-green-800">
                  <Accessibility className="w-3 h-3 mr-1" /> Wheelchair
                </Badge>
              )}
              {event.mobility_friendly && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Accessibility className="w-3 h-3 mr-1" /> Mobility
                </Badge>
              )}
              {event.hearing_accessible && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Volume2 className="w-3 h-3 mr-1" /> Hearing
                </Badge>
              )}
              {event.vision_accessible && (
                <Badge className="bg-purple-100 text-purple-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Vision
                </Badge>
              )}
              {event.sensory_friendly && (
                <Badge className="bg-teal-100 text-teal-800">
                  <Sparkles className="w-3 h-3 mr-1" /> Sensory
                </Badge>
              )}
              {event.service_animals_allowed && (
                <Badge className="bg-orange-100 text-orange-800">
                  <Heart className="w-3 h-3 mr-1" /> Service Animals
                </Badge>
              )}
            </div>
            {event.accessibility_notes && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="text-sm mt-1">{event.accessibility_notes}</p>
              </div>
            )}
          </Section>

          {/* Cultural Context */}
          <Section icon={Globe} title="Cultural Context" color="bg-indigo-500">
            {event.religious_context && event.religious_context.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground block mb-2">Religious Context</span>
                <div className="flex flex-wrap gap-1.5">
                  {event.religious_context.map((religion, index) => (
                    <Badge key={index} variant="outline" className="text-xs capitalize">
                      {religion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {event.dietary_context && event.dietary_context.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground block mb-2">Dietary Options</span>
                <div className="flex flex-wrap gap-1.5">
                  {event.dietary_context.map((diet, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Utensils className="w-3 h-3 mr-1" />
                      {formatLabel(diet)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {event.traditional_attire && event.traditional_attire !== 'not_applicable' && (
              <InfoItem label="Attire" value={formatLabel(event.traditional_attire)} />
            )}
          </Section>

          {/* Prerequisites */}
          <Section icon={GraduationCap} title="Prerequisites" color="bg-orange-500">
            {event.skill_level && (
              <InfoItem label="Skill Level" value={formatLabel(event.skill_level)} />
            )}
            {event.prior_experience && (
              <InfoItem label="Experience" value={formatLabel(event.prior_experience)} />
            )}
            {event.physical_fitness && (
              <InfoItem label="Fitness Level" value={formatLabel(event.physical_fitness)} />
            )}
            {event.dress_code && event.dress_code !== 'casual' && (
              <InfoItem label="Dress Code" value={formatLabel(event.dress_code)} />
            )}
            {event.equipment_required && event.equipment_required.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground block mb-2">Equipment Needed</span>
                <div className="flex flex-wrap gap-1.5">
                  {event.equipment_required.map((eq, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {formatLabel(eq)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {event.prerequisites_notes && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Notes:</span>
                <p className="text-sm mt-1">{event.prerequisites_notes}</p>
              </div>
            )}
          </Section>

          {/* Content & Intensity */}
          <Section icon={AlertCircle} title="Content & Intensity" color="bg-red-500">
            {event.content_rating && (
              <InfoItem label="Content Rating" value={formatLabel(event.content_rating)} />
            )}
            {event.alcohol_served && (
              <InfoItem label="Alcohol" value={formatLabel(event.alcohol_served)} />
            )}
            {event.smoking_policy && (
              <InfoItem label="Smoking" value={formatLabel(event.smoking_policy)} />
            )}
            {event.noise_level && (
              <InfoItem label="Noise Level" value={formatLabel(event.noise_level)} />
            )}
            {event.physical_intensity && (
              <InfoItem label="Intensity" value={formatLabel(event.physical_intensity)} />
            )}
          </Section>

          {/* Social Features */}
          <Section icon={PartyPopper} title="Social Features" color="bg-pink-500">
            <div className="flex flex-wrap gap-2">
              {event.networking_focus && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Briefcase className="w-3 h-3 mr-1" /> Networking
                </Badge>
              )}
              {event.social_mixer && (
                <Badge className="bg-green-100 text-green-800">
                  <PartyPopper className="w-3 h-3 mr-1" /> Social Mixer
                </Badge>
              )}
              {event.ice_breakers && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Sparkles className="w-3 h-3 mr-1" /> Ice Breakers
                </Badge>
              )}
              {event.group_activities && (
                <Badge className="bg-purple-100 text-purple-800">
                  <Users className="w-3 h-3 mr-1" /> Group Activities
                </Badge>
              )}
              {event.team_building && (
                <Badge className="bg-pink-100 text-pink-800">
                  <Heart className="w-3 h-3 mr-1" /> Team Building
                </Badge>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};
