import { Accessibility, Ear, Eye, Sparkles, Dog, Car, FileText } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AccessibilitySectionProps {
  wheelchairAccessible: boolean;
  mobilityFriendly: boolean;
  hearingAccessible: boolean;
  visionAccessible: boolean;
  sensoryFriendly: boolean;
  serviceAnimalsAllowed: boolean;
  accessibilityNotes: string;
  onWheelchairAccessibleChange: (value: boolean) => void;
  onMobilityFriendlyChange: (value: boolean) => void;
  onHearingAccessibleChange: (value: boolean) => void;
  onVisionAccessibleChange: (value: boolean) => void;
  onSensoryFriendlyChange: (value: boolean) => void;
  onServiceAnimalsAllowedChange: (value: boolean) => void;
  onAccessibilityNotesChange: (value: string) => void;
}

const accessibilityOptions = [
  {
    id: 'wheelchair',
    label: 'Wheelchair Accessible',
    description: 'Ramps, wide doorways, accessible restrooms',
    icon: Accessibility,
    checked: 'wheelchairAccessible',
    onChange: 'onWheelchairAccessibleChange',
  },
  {
    id: 'mobility',
    label: 'Mobility Friendly',
    description: 'Elevators, minimal stairs, resting areas',
    icon: Car,
    checked: 'mobilityFriendly',
    onChange: 'onMobilityFriendlyChange',
  },
  {
    id: 'hearing',
    label: 'Hearing Accessible',
    description: 'ASL interpreters, hearing loops, captions',
    icon: Ear,
    checked: 'hearingAccessible',
    onChange: 'onHearingAccessibleChange',
  },
  {
    id: 'vision',
    label: 'Vision Accessible',
    description: 'Large print, braille, screen reader support',
    icon: Eye,
    checked: 'visionAccessible',
    onChange: 'onVisionAccessibleChange',
  },
  {
    id: 'sensory',
    label: 'Sensory Friendly',
    description: 'Low noise, no flashing lights, quiet spaces',
    icon: Sparkles,
    checked: 'sensoryFriendly',
    onChange: 'onSensoryFriendlyChange',
  },
  {
    id: 'service_animals',
    label: 'Service Animals Allowed',
    description: 'Welcome service animals and emotional support pets',
    icon: Dog,
    checked: 'serviceAnimalsAllowed',
    onChange: 'onServiceAnimalsAllowedChange',
  },
];

export const AccessibilitySection = ({
  wheelchairAccessible,
  mobilityFriendly,
  hearingAccessible,
  visionAccessible,
  sensoryFriendly,
  serviceAnimalsAllowed,
  accessibilityNotes,
  onWheelchairAccessibleChange,
  onMobilityFriendlyChange,
  onHearingAccessibleChange,
  onVisionAccessibleChange,
  onSensoryFriendlyChange,
  onServiceAnimalsAllowedChange,
  onAccessibilityNotesChange,
}: AccessibilitySectionProps) => {
  const getValue = (id: string) => {
    switch (id) {
      case 'wheelchair': return wheelchairAccessible;
      case 'mobility': return mobilityFriendly;
      case 'hearing': return hearingAccessible;
      case 'vision': return visionAccessible;
      case 'sensory': return sensoryFriendly;
      case 'service_animals': return serviceAnimalsAllowed;
      default: return false;
    }
  };

  const handleChange = (id: string, value: boolean) => {
    switch (id) {
      case 'wheelchair': onWheelchairAccessibleChange(value); break;
      case 'mobility': onMobilityFriendlyChange(value); break;
      case 'hearing': onHearingAccessibleChange(value); break;
      case 'vision': onVisionAccessibleChange(value); break;
      case 'sensory': onSensoryFriendlyChange(value); break;
      case 'service_animals': onServiceAnimalsAllowedChange(value); break;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-primary" />
          Accessibility Features
        </h3>
        <p className="text-sm text-muted-foreground">
          Make your event welcoming for everyone. Select the accessibility features available at your venue.
          All fields are optional but help attendees with specific needs find suitable events.
        </p>
      </div>

      {/* Accessibility Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {accessibilityOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                getValue(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getValue(option.id) ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={option.id} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
              <Switch
                id={option.id}
                checked={getValue(option.id)}
                onCheckedChange={(checked) => handleChange(option.id, checked)}
              />
            </div>
          );
        })}
      </div>

      {/* Additional Notes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <Label htmlFor="accessibility-notes" className="font-medium">
            Additional Accessibility Information
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Provide any specific details about accessibility accommodations, limitations, or special arrangements.
        </p>
        <Textarea
          id="accessibility-notes"
          placeholder="Example: Limited accessible parking available near entrance. Elevator access to all floors. Quiet room available for sensory breaks..."
          value={accessibilityNotes}
          onChange={(e) => onAccessibilityNotesChange(e.target.value)}
          className="min-h-[120px]"
        />
      </div>

      {/* Helpful Tip */}
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Why this matters:</strong> Over 1 billion people worldwide live with disabilities. 
          By marking accessibility features, you help create an inclusive environment and reach a broader audience 
          who might otherwise skip your event.
        </p>
      </div>
    </div>
  );
};
