import { useState } from 'react';
import { Users } from 'lucide-react';

// Import smaller components
import { RegistrationPrivacySelector } from './RegistrationPrivacySelector';
import { RegistrationTiming } from './RegistrationTiming';
import { RegistrationSettings } from './RegistrationSettings';
import { AccessibilityFeatures } from './AccessibilityFeatures';

interface RegistrationSectionProps {
  eventPrivacy: 'public' | 'private' | 'unlisted';
  eventPassword: string;
  ageRestriction: string;
  accessibilityOptions: string;
  eventContactEmail: string;
  registrationStartTime: Date | null;
  registrationEndTime: Date | null;
  onEventPrivacyChange: (value: 'public' | 'private' | 'unlisted') => void;
  onEventPasswordChange: (value: string) => void;
  onAgeRestrictionChange: (value: string) => void;
  onAccessibilityOptionsChange: (value: string) => void;
  onEventContactEmailChange: (value: string) => void;
  onRegistrationStartTimeChange: (value: Date | null) => void;
  onRegistrationEndTimeChange: (value: Date | null) => void;
}

export const RegistrationSection = ({
  eventPrivacy,
  eventPassword,
  ageRestriction,
  accessibilityOptions,
  eventContactEmail,
  registrationStartTime,
  registrationEndTime,
  onEventPrivacyChange,
  onEventPasswordChange,
  onAgeRestrictionChange,
  onAccessibilityOptionsChange,
  onEventContactEmailChange,
  onRegistrationStartTimeChange,
  onRegistrationEndTimeChange,
}: RegistrationSectionProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-8">
      {/* Privacy Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold">Event Privacy</h3>
        </div>
        <p className="text-white mb-6">
          Control who can find and register for your event
        </p>
        
        <RegistrationPrivacySelector
          eventPrivacy={eventPrivacy}
          onEventPrivacyChange={onEventPrivacyChange}
        />
      </div>

      {/* Registration Timing */}
      <RegistrationTiming
        registrationStartTime={registrationStartTime}
        registrationEndTime={registrationEndTime}
        onRegistrationStartTimeChange={onRegistrationStartTimeChange}
        onRegistrationEndTimeChange={onRegistrationEndTimeChange}
      />

      {/* Registration Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Registration Settings</h3>
        <p className="text-white mb-6">
          Configure additional registration requirements and options
        </p>
        
        <RegistrationSettings
          eventPrivacy={eventPrivacy}
          eventPassword={eventPassword}
          ageRestriction={ageRestriction}
          eventContactEmail={eventContactEmail}
          onEventPasswordChange={onEventPasswordChange}
          onAgeRestrictionChange={onAgeRestrictionChange}
          onEventContactEmailChange={onEventContactEmailChange}
        />
      </div>

      {/* Accessibility Features */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
        <p className="text-white mb-6">
          Let attendees know about accessibility features available at your event
        </p>
        
        <AccessibilityFeatures
          accessibilityOptions={accessibilityOptions}
          onAccessibilityOptionsChange={onAccessibilityOptionsChange}
        />
      </div>
    </div>
  );
};
