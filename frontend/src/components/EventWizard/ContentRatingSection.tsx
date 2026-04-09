import { AlertCircle, Wine, Cigarette, Volume2, Zap, Users, MessageCircle, Target, HandHeart } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface ContentRatingSectionProps {
  contentRating: 'all_ages' | 'pg' | 'pg_13' | 'mature_18' | 'explicit';
  alcoholServed: 'no_alcohol' | 'byob' | 'bar_available' | 'complimentary';
  smokingPolicy: 'non_smoking' | 'smoking_area' | 'vape_friendly';
  noiseLevel: 'quiet' | 'moderate' | 'loud' | 'very_loud';
  physicalIntensity: 'none' | 'low' | 'medium' | 'high' | 'extreme';
  networkingFocus: boolean;
  socialMixer: boolean;
  iceBreakers: boolean;
  groupActivities: boolean;
  teamBuilding: boolean;
  onContentRatingChange: (rating: 'all_ages' | 'pg' | 'pg_13' | 'mature_18' | 'explicit') => void;
  onAlcoholServedChange: (policy: 'no_alcohol' | 'byob' | 'bar_available' | 'complimentary') => void;
  onSmokingPolicyChange: (policy: 'non_smoking' | 'smoking_area' | 'vape_friendly') => void;
  onNoiseLevelChange: (level: 'quiet' | 'moderate' | 'loud' | 'very_loud') => void;
  onPhysicalIntensityChange: (intensity: 'none' | 'low' | 'medium' | 'high' | 'extreme') => void;
  onNetworkingFocusChange: (value: boolean) => void;
  onSocialMixerChange: (value: boolean) => void;
  onIceBreakersChange: (value: boolean) => void;
  onGroupActivitiesChange: (value: boolean) => void;
  onTeamBuildingChange: (value: boolean) => void;
}

const contentRatingOptions = [
  { 
    value: 'all_ages', 
    label: 'All Ages', 
    description: 'Suitable for everyone, including young children',
    color: 'bg-green-500'
  },
  { 
    value: 'pg', 
    label: 'PG', 
    description: 'Parental guidance suggested. Mild content.',
    color: 'bg-blue-500'
  },
  { 
    value: 'pg_13', 
    label: 'PG-13', 
    description: 'Parents strongly cautioned. Some material may be inappropriate for children under 13.',
    color: 'bg-yellow-500'
  },
  { 
    value: 'mature_18', 
    label: 'Mature (18+)', 
    description: 'Adults only. Contains mature themes.',
    color: 'bg-orange-500'
  },
  { 
    value: 'explicit', 
    label: 'Explicit', 
    description: 'Graphic content. Strictly 18+ with ID.',
    color: 'bg-red-500'
  },
];

const alcoholOptions = [
  { value: 'no_alcohol', label: 'No Alcohol', description: 'Alcohol-free event' },
  { value: 'byob', label: 'BYOB', description: 'Bring Your Own Bottle' },
  { value: 'bar_available', label: 'Bar Available', description: 'Alcohol available for purchase' },
  { value: 'complimentary', label: 'Complimentary', description: 'Free drinks included' },
];

const smokingOptions = [
  { value: 'non_smoking', label: 'Non-Smoking', description: 'No smoking or vaping allowed' },
  { value: 'smoking_area', label: 'Smoking Area', description: 'Designated outdoor smoking area' },
  { value: 'vape_friendly', label: 'Vape Friendly', description: 'Vaping permitted indoors' },
];

const noiseOptions = [
  { value: 'quiet', label: 'Quiet', description: 'Library-level silence, conversations whispered' },
  { value: 'moderate', label: 'Moderate', description: 'Normal conversation levels' },
  { value: 'loud', label: 'Loud', description: 'Music, cheering, energetic atmosphere' },
  { value: 'very_loud', label: 'Very Loud', description: 'Concerts, parties, high volume' },
];

const intensityOptions = [
  { value: 'none', label: 'None', description: 'Sedentary, minimal movement' },
  { value: 'low', label: 'Low', description: 'Light movement, casual pace' },
  { value: 'medium', label: 'Medium', description: 'Active participation, some exertion' },
  { value: 'high', label: 'High', description: 'Vigorous activity, sustained effort' },
  { value: 'extreme', label: 'Extreme', description: 'Maximum physical exertion' },
];

const socialFeatures = [
  {
    id: 'networking',
    label: 'Networking Focus',
    description: 'Professional connections and career building',
    icon: Users,
    checked: 'networkingFocus',
    onChange: 'onNetworkingFocusChange',
  },
  {
    id: 'social_mixer',
    label: 'Social Mixer',
    description: 'Casual mingling and socializing',
    icon: MessageCircle,
    checked: 'socialMixer',
    onChange: 'onSocialMixerChange',
  },
  {
    id: 'ice_breakers',
    label: 'Ice Breakers',
    description: 'Activities to help people connect',
    icon: HandHeart,
    checked: 'iceBreakers',
    onChange: 'onIceBreakersChange',
  },
  {
    id: 'group_activities',
    label: 'Group Activities',
    description: 'Collaborative exercises and games',
    icon: Target,
    checked: 'groupActivities',
    onChange: 'onGroupActivitiesChange',
  },
  {
    id: 'team_building',
    label: 'Team Building',
    description: 'Strengthen group dynamics',
    icon: Zap,
    checked: 'teamBuilding',
    onChange: 'onTeamBuildingChange',
  },
];

export const ContentRatingSection = ({
  contentRating,
  alcoholServed,
  smokingPolicy,
  noiseLevel,
  physicalIntensity,
  networkingFocus,
  socialMixer,
  iceBreakers,
  groupActivities,
  teamBuilding,
  onContentRatingChange,
  onAlcoholServedChange,
  onSmokingPolicyChange,
  onNoiseLevelChange,
  onPhysicalIntensityChange,
  onNetworkingFocusChange,
  onSocialMixerChange,
  onIceBreakersChange,
  onGroupActivitiesChange,
  onTeamBuildingChange,
}: ContentRatingSectionProps) => {
  const getSocialValue = (id: string) => {
    switch (id) {
      case 'networking': return networkingFocus;
      case 'social_mixer': return socialMixer;
      case 'ice_breakers': return iceBreakers;
      case 'group_activities': return groupActivities;
      case 'team_building': return teamBuilding;
      default: return false;
    }
  };

  const handleSocialChange = (id: string, value: boolean) => {
    switch (id) {
      case 'networking': onNetworkingFocusChange(value); break;
      case 'social_mixer': onSocialMixerChange(value); break;
      case 'ice_breakers': onIceBreakersChange(value); break;
      case 'group_activities': onGroupActivitiesChange(value); break;
      case 'team_building': onTeamBuildingChange(value); break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Content Rating */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Content Rating</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What age group is this event appropriate for?
        </p>
        <RadioGroup
          value={contentRating}
          onValueChange={(value) => onContentRatingChange(value as typeof contentRating)}
          className="grid grid-cols-1 gap-3"
        >
          {contentRatingOptions.map((option) => (
            <div key={option.value} className="relative">
              <RadioGroupItem
                value={option.value}
                id={`rating-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`rating-${option.value}`}
                className="flex items-center gap-4 p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className={`w-4 h-4 rounded-full ${option.color}`} />
                <div className="flex-1">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Alcohol Policy */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wine className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Alcohol Policy</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Will alcohol be available at your event?
        </p>
        <RadioGroup
          value={alcoholServed}
          onValueChange={(value) => onAlcoholServedChange(value as typeof alcoholServed)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {alcoholOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`alcohol-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`alcohol-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Smoking Policy */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cigarette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Smoking Policy</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          What is your policy on smoking and vaping?
        </p>
        <RadioGroup
          value={smokingPolicy}
          onValueChange={(value) => onSmokingPolicyChange(value as typeof smokingPolicy)}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {smokingOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`smoking-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`smoking-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Noise Level */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Noise Level</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          How loud will your event be?
        </p>
        <RadioGroup
          value={noiseLevel}
          onValueChange={(value) => onNoiseLevelChange(value as typeof noiseLevel)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {noiseOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`noise-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`noise-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Physical Intensity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Physical Intensity</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          How physically demanding is this event?
        </p>
        <RadioGroup
          value={physicalIntensity}
          onValueChange={(value) => onPhysicalIntensityChange(value as typeof physicalIntensity)}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {intensityOptions.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={`intensity-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`intensity-${option.value}`}
                className="flex flex-col p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Social & Networking Features */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Social & Networking Features</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Does your event include any of these social elements?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {socialFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                  getSocialValue(feature.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSocialValue(feature.id) ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={feature.id} className="font-medium cursor-pointer">
                      {feature.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <Switch
                  id={feature.id}
                  checked={getSocialValue(feature.id)}
                  onCheckedChange={(checked) => handleSocialChange(feature.id, checked)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
