import React, { useState } from 'react';
import { 
  Users, Accessibility, Globe, GraduationCap, AlertCircle, 
  Utensils, Volume2, Wine, Cigarette,
  Briefcase, PartyPopper, Heart, Baby, Sparkles,
  Languages, LayoutGrid, DollarSign, CheckCircle2,
  Zap, Target, Palette, Calendar,
  MapPin, Star, Info, Shield
} from 'lucide-react';
import { Event } from './types';
import { cn } from '@/lib/utils';

interface EventDetailAttributesProps {
  event: Event;
}

const formatLabel = (text: string | null | undefined) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getIntensityColor = (level?: string) => {
  switch (level) {
    case 'none': return 'bg-green-500';
    case 'low': return 'bg-blue-500';
    case 'moderate': return 'bg-yellow-500';
    case 'high': return 'bg-orange-500';
    case 'extreme': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

const getIntensityPercent = (level?: string) => {
  switch (level) {
    case 'none': return 0;
    case 'low': return 25;
    case 'moderate': return 50;
    case 'high': return 75;
    case 'extreme': return 100;
    default: return 0;
  }
};

const ProgressBar = ({ level, label }: { level?: string; label: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{formatLabel(level)}</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-1000", getIntensityColor(level))} style={{ width: `${getIntensityPercent(level)}%` }} />
    </div>
  </div>
);

const FeatureBadge = ({ icon: Icon, label, active, colorClass }: { icon: React.ElementType; label: string; active: boolean; colorClass: string }) => {
  if (!active) return null;
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300", colorClass)}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      <CheckCircle2 className="w-3 h-3 ml-auto text-white/70" />
    </div>
  );
};

const TabButton = ({ icon: Icon, label, isActive, onClick, color, hasContent }: { icon: React.ElementType; label: string; isActive: boolean; onClick: () => void; color: string; hasContent: boolean }) => (
  <button onClick={onClick} disabled={!hasContent} className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 text-left whitespace-nowrap shrink-0 min-w-[120px] md:min-w-0 md:w-full",
    isActive ? `${color} text-white shadow-md` : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
    !hasContent && "opacity-50 cursor-not-allowed"
  )}>
    <Icon className="w-5 h-5 shrink-0" />
    <span className="font-medium text-sm">{label}</span>
    <div className={cn("ml-auto w-1.5 h-1.5 rounded-full transition-opacity duration-200", isActive ? "bg-white opacity-100" : "opacity-0")} />
  </button>
);

const TabContent = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => (
  <div className={cn("transition-all duration-500", isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 hidden")}>
    {children}
  </div>
);

const InfoRow = ({ icon: Icon, label, value, color = "text-primary" }: { icon: React.ElementType; label: string; value: React.ReactNode; color?: string }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className={cn("w-4 h-4 mt-0.5", color)} />
    <div>
      <span className="text-sm text-muted-foreground block">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  </div>
);

const SectionCard = ({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/50 p-5 shadow-sm", className)}>
    <h4 className="font-semibold text-lg">{title}</h4>
    {description && <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>}
    {!description && <div className="mb-4" />}
    {children}
  </div>
);

export const EventDetailAttributes: React.FC<EventDetailAttributesProps> = ({ event }) => {
  const [activeTab, setActiveTab] = useState('audience');

  const tabs = [
    { id: 'audience', label: 'Audience', icon: Users, color: 'bg-gradient-to-r from-blue-500 to-blue-600', hasContent: !!(event.age_categories || event.gender_preference || event.family_friendly || event.senior_friendly) },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, color: 'bg-gradient-to-r from-teal-500 to-teal-600', hasContent: !!(event.wheelchair_accessible || event.mobility_friendly || event.hearing_accessible) },
    { id: 'cultural', label: 'Cultural', icon: Globe, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600', hasContent: !!(event.religious_context || event.dietary_context) },
    { id: 'prerequisites', label: 'Prerequisites', icon: GraduationCap, color: 'bg-gradient-to-r from-orange-500 to-orange-600', hasContent: !!(event.skill_level || event.prior_experience || event.physical_fitness) },
    { id: 'content', label: 'Content', icon: AlertCircle, color: 'bg-gradient-to-r from-red-500 to-red-600', hasContent: !!(event.content_rating || event.alcohol_served || event.smoking_policy) },
    { id: 'social', label: 'Social', icon: PartyPopper, color: 'bg-gradient-to-r from-pink-500 to-pink-600', hasContent: !!(event.networking_focus || event.social_mixer || event.ice_breakers) },
    { id: 'language', label: 'Language', icon: Languages, color: 'bg-gradient-to-r from-cyan-500 to-cyan-600', hasContent: !!(event.primary_language || event.secondary_languages) },
    { id: 'format', label: 'Format', icon: LayoutGrid, color: 'bg-gradient-to-r from-violet-500 to-violet-600', hasContent: !!(event.event_type || event.format || event.sub_category) },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600', hasContent: !!(event.refund_policy || event.group_discounts) }
  ];

  const hasAnyContent = tabs.some(t => t.hasContent);
  if (!hasAnyContent) return null;

  const firstWithContent = tabs.find(t => t.hasContent)?.id;
  const currentTab = tabs.find(t => t.id === activeTab)?.hasContent ? activeTab : firstWithContent;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
        <h2 className="text-2xl font-bold text-foreground">Event Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
        {/* Tabs - Horizontal scroll on mobile, Vertical on desktop */}
        <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
          {tabs.filter(t => t.hasContent).map(tab => (
            <TabButton 
              key={tab.id} 
              icon={tab.icon} 
              label={tab.label} 
              isActive={currentTab === tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              color={tab.color} 
              hasContent={tab.hasContent} 
            />
          ))}
        </div>

        {/* Content - Right Side */}
        <div className="min-h-[250px]">
        <TabContent isActive={currentTab === 'audience'}>
          <SectionCard 
            title="Who's Welcome" 
            description="Find out if this event is a good match for you based on age, gender preference, and family-friendly features."
          >
            <div className="space-y-4">
              {event.age_categories?.length > 0 && (
                <div>
                  <span className="text-sm font-semibold mb-2 block">Age Groups</span>
                  <div className="flex flex-wrap gap-2">
                    {event.age_categories.map((age, i) => (
                      <div key={i} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">{formatLabel(age)}</div>
                    ))}
                  </div>
                </div>
              )}
              {event.gender_preference && event.gender_preference !== 'all' && <InfoRow icon={Target} label="Gender" value={formatLabel(event.gender_preference)} color="text-blue-500" />}
              <div className="grid grid-cols-2 gap-2">
                <FeatureBadge icon={Baby} label="Family" active={!!event.family_friendly} colorClass="bg-green-500 text-white" />
                <FeatureBadge icon={Heart} label="Seniors" active={!!event.senior_friendly} colorClass="bg-blue-500 text-white" />
                <FeatureBadge icon={Users} label="Singles" active={!!event.singles_friendly} colorClass="bg-purple-500 text-white" />
                <FeatureBadge icon={Heart} label="Couples" active={!!event.couples_oriented} colorClass="bg-pink-500 text-white" />
              </div>
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'accessibility'}>
          <SectionCard 
            title="Accessibility Features"
            description="Information about accommodations available for people with different accessibility needs."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <FeatureBadge icon={Accessibility} label="Wheelchair" active={!!event.wheelchair_accessible} colorClass="bg-green-500 text-white" />
              <FeatureBadge icon={Accessibility} label="Mobility" active={!!event.mobility_friendly} colorClass="bg-blue-500 text-white" />
              <FeatureBadge icon={Volume2} label="Hearing" active={!!event.hearing_accessible} colorClass="bg-yellow-500 text-white" />
              <FeatureBadge icon={CheckCircle2} label="Vision" active={!!event.vision_accessible} colorClass="bg-purple-500 text-white" />
              <FeatureBadge icon={Sparkles} label="Sensory" active={!!event.sensory_friendly} colorClass="bg-teal-500 text-white" />
              <FeatureBadge icon={Heart} label="Service Animals" active={!!event.service_animals_allowed} colorClass="bg-orange-500 text-white" />
            </div>
            {event.accessibility_notes && <div className="mt-4 p-3 bg-teal-50 rounded-lg"><InfoRow icon={Info} label="Notes" value={event.accessibility_notes} color="text-teal-500" /></div>}
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'cultural'}>
          <SectionCard 
            title="Cultural Context"
            description="Details about religious, dietary, and cultural aspects of this event to help you feel prepared and comfortable."
          >
            <div className="space-y-4">
              {event.religious_context?.length > 0 && (
                <div>
                  <span className="text-sm font-semibold mb-2 block">Religious Context</span>
                  <div className="flex flex-wrap gap-2">
                    {event.religious_context.map((r, i) => <div key={i} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm capitalize">{r}</div>)}
                  </div>
                </div>
              )}
              {event.dietary_context?.length > 0 && (
                <div>
                  <span className="text-sm font-semibold mb-2 block">Dietary Options</span>
                  <div className="flex flex-wrap gap-2">
                    {event.dietary_context.map((d, i) => <div key={i} className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs">{formatLabel(d)}</div>)}
                  </div>
                </div>
              )}
              {event.traditional_attire && event.traditional_attire !== 'not_applicable' && <InfoRow icon={Palette} label="Attire" value={formatLabel(event.traditional_attire)} color="text-indigo-500" />}
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'prerequisites'}>
          <SectionCard 
            title="What You Need"
            description="Important things to know before attending - skill level, what to bring, and how to prepare."
          >
            <div className="space-y-4">
              {event.skill_level && <ProgressBar level={event.skill_level} label="Skill Level" />}
              {event.prior_experience && <InfoRow icon={Target} label="Experience" value={formatLabel(event.prior_experience)} color="text-orange-500" />}
              {event.physical_fitness && <ProgressBar level={event.physical_fitness} label="Physical Fitness" />}
              {event.equipment_required?.length > 0 && (
                <div>
                  <span className="text-sm font-semibold mb-2 block">Equipment</span>
                  <div className="flex flex-wrap gap-2">
                    {event.equipment_required.map((eq, i) => <div key={i} className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm">{formatLabel(eq)}</div>)}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'content'}>
          <SectionCard 
            title="Content & Intensity"
            description="What to expect at this event - noise levels, physical activity, and age appropriateness."
          >
            <div className="space-y-4">
              {event.content_rating && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className={cn("px-3 py-1 rounded-lg text-sm font-bold text-white", event.content_rating === 'all_ages' ? "bg-green-500" : event.content_rating === 'adults_only' ? "bg-red-500" : "bg-yellow-500")}>{formatLabel(event.content_rating)}</div>
                </div>
              )}
              {event.noise_level && <ProgressBar level={event.noise_level} label="Noise Level" />}
              {event.physical_intensity && <ProgressBar level={event.physical_intensity} label="Intensity" />}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <FeatureBadge icon={Wine} label={event.alcohol_served === 'no_alcohol' ? 'No Alcohol' : 'Alcohol'} active={event.alcohol_served !== 'no_alcohol'} colorClass={event.alcohol_served === 'no_alcohol' ? "bg-green-500 text-white" : "bg-amber-500 text-white"} />
                <FeatureBadge icon={Cigarette} label={event.smoking_policy === 'non_smoking' ? 'No Smoking' : 'Smoking'} active={event.smoking_policy !== 'non_smoking'} colorClass={event.smoking_policy === 'non_smoking' ? "bg-green-500 text-white" : "bg-gray-500 text-white"} />
              </div>
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'social'}>
          <SectionCard 
            title="Social Vibe"
            description="The social atmosphere and networking opportunities you can expect at this event."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <FeatureBadge icon={Briefcase} label="Networking" active={!!event.networking_focus} colorClass="bg-blue-500 text-white" />
              <FeatureBadge icon={PartyPopper} label="Mixer" active={!!event.social_mixer} colorClass="bg-green-500 text-white" />
              <FeatureBadge icon={Sparkles} label="Ice Breakers" active={!!event.ice_breakers} colorClass="bg-yellow-500 text-white" />
              <FeatureBadge icon={Users} label="Group" active={!!event.group_activities} colorClass="bg-purple-500 text-white" />
              <FeatureBadge icon={Heart} label="Team Building" active={!!event.team_building} colorClass="bg-pink-500 text-white" />
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'language'}>
          <SectionCard 
            title="Language"
            description="Languages spoken at this event and interpretation services available."
          >
            <div className="space-y-4">
              {event.primary_language && <InfoRow icon={Languages} label="Primary" value={formatLabel(event.primary_language)} color="text-cyan-500" />}
              {event.secondary_languages?.length > 0 && (
                <div>
                  <span className="text-sm font-semibold mb-2 block">Also Available</span>
                  <div className="flex flex-wrap gap-2">
                    {event.secondary_languages.map((l, i) => <div key={i} className="px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-sm">{formatLabel(l)}</div>)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <FeatureBadge icon={Languages} label="Interpretation" active={!!event.interpretation_available} colorClass="bg-cyan-500 text-white" />
                <FeatureBadge icon={Accessibility} label="Sign Language" active={!!event.sign_language_interpreter} colorClass="bg-blue-500 text-white" />
              </div>
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'format'}>
          <SectionCard 
            title="Event Type & Format"
            description="The structure and style of this event - whether it's in-person, virtual, a workshop, performance, etc."
          >
            <div className="space-y-2">
              {event.event_type && <InfoRow icon={MapPin} label="Type" value={formatLabel(event.event_type)} color="text-violet-500" />}
              {event.format && <InfoRow icon={Calendar} label="Format" value={formatLabel(event.format)} color="text-violet-500" />}
              {event.sub_category && <InfoRow icon={Star} label="Category" value={formatLabel(event.sub_category)} color="text-violet-500" />}
            </div>
          </SectionCard>
        </TabContent>

        <TabContent isActive={currentTab === 'pricing'}>
          <SectionCard 
            title="Pricing & Refunds"
            description="Payment policies, refund options, and special group discounts for this event."
          >
            <div className="space-y-4">
              {event.refund_policy && <InfoRow icon={Shield} label="Refund Policy" value={formatLabel(event.refund_policy)} color="text-emerald-500" />}
              {event.group_discounts && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700 block">Group Discounts Available!</span>
                      <p className="text-sm text-emerald-600">Bring friends and save</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </TabContent>
        </div>
      </div>
    </section>
  );
};

export default EventDetailAttributes;
