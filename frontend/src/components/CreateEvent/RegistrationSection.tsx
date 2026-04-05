import { useState } from 'react';
import { Users, Lock, Calendar, Shield, Mail, Clock } from 'lucide-react';

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

  const privacyOptions = [
    {
      id: 'public',
      title: 'Public',
      description: 'Anyone can find and register for this event',
      icon: Users,
      color: 'bg-green-50 border-green-200 text-green-700',
    },
    {
      id: 'private',
      title: 'Private',
      description: 'Only people with the link can register',
      icon: Lock,
      color: 'bg-red-50 border-red-200 text-red-700',
    },
    {
      id: 'unlisted',
      title: 'Unlisted',
      description: 'Not searchable, only accessible via direct link',
      icon: Shield,
      color: 'bg-gray-50 border-gray-200 text-gray-700',
    },
  ];

  const ageRestrictions = [
    { value: '', label: 'No age restriction' },
    { value: 'all_ages', label: 'All ages' },
    { value: '18+', label: '18+' },
    { value: '21+', label: '21+' },
    { value: '13+', label: '13+' },
    { value: '16+', label: '16+' },
    { value: 'custom', label: 'Custom restriction' },
  ];

  const accessibilityFeatures = [
    { id: 'wheelchair', label: 'Wheelchair accessible' },
    { id: 'parking', label: 'Accessible parking' },
    { id: 'restroom', label: 'Accessible restrooms' },
    { id: 'elevator', label: 'Elevator access' },
    { id: 'ramp', label: 'Ramp access' },
    { id: 'sign_language', label: 'Sign language interpreter' },
    { id: 'captions', label: 'Closed captions' },
    { id: 'audio_description', label: 'Audio description' },
    { id: 'quiet_space', label: 'Quiet space available' },
    { id: 'service_animals', label: 'Service animals welcome' },
  ];

  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    accessibilityOptions ? accessibilityOptions.split(',').map(s => s.trim()) : []
  );

  const handleAccessibilityToggle = (featureId: string) => {
    const updated = selectedAccessibility.includes(featureId)
      ? selectedAccessibility.filter(id => id !== featureId)
      : [...selectedAccessibility, featureId];
    setSelectedAccessibility(updated);
    onAccessibilityOptionsChange(updated.join(', '));
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-8">
      {/* Privacy Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Event Privacy</h3>
        <p className="text-gray-600 mb-6">
          Control who can find and register for your event
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {privacyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onEventPrivacyChange(option.id as any)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  eventPrivacy === option.id
                    ? `${option.color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-6 h-6" />
                  <span className="font-semibold">{option.title}</span>
                </div>
                <p className="text-sm opacity-80">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Password Protection for Private Events */}
        {eventPrivacy === 'private' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium">Event Password (Optional)</label>
            </div>
            <input
              type="password"
              placeholder="Add password protection"
              value={eventPassword}
              onChange={(e) => onEventPasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to allow anyone with the link to register
            </p>
          </div>
        )}
      </div>

      {/* Registration Period */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Registration Period</h3>
        <p className="text-gray-600 mb-6">
          Set when registration opens and closes
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Registration Opens
            </label>
            <input
              type="datetime-local"
              value={formatDateTime(registrationStartTime)}
              onChange={(e) => onRegistrationStartTimeChange(
                e.target.value ? new Date(e.target.value) : null
              )}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to open registration immediately
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              Registration Closes
            </label>
            <input
              type="datetime-local"
              value={formatDateTime(registrationEndTime)}
              onChange={(e) => onRegistrationEndTimeChange(
                e.target.value ? new Date(e.target.value) : null
              )}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to close at event start time
            </p>
          </div>
        </div>
      </div>

      {/* Age Restrictions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Age Restrictions</h3>
        <p className="text-gray-600 mb-4">
          Set age requirements for attendees
        </p>
        
        <div className="max-w-md">
          <select
            value={ageRestriction}
            onChange={(e) => onAgeRestrictionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ageRestrictions.map((restriction) => (
              <option key={restriction.value} value={restriction.value}>
                {restriction.label}
              </option>
            ))}
          </select>
        </div>

        {ageRestriction === 'custom' && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="e.g., 16+ with adult supervision"
              value={ageRestriction}
              onChange={(e) => onAgeRestrictionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Accessibility Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
        <p className="text-gray-600 mb-6">
          Let attendees know about accessibility features
        </p>
        
        <div className="grid md:grid-cols-2 gap-3">
          {accessibilityFeatures.map((feature) => (
            <label
              key={feature.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedAccessibility.includes(feature.id)}
                onChange={() => handleAccessibilityToggle(feature.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-sm">{feature.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <textarea
            placeholder="Additional accessibility information..."
            value={accessibilityOptions}
            onChange={(e) => onAccessibilityOptionsChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <p className="text-gray-600 mb-4">
          Provide contact details for event-specific inquiries
        </p>
        
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2">
            <Mail className="inline w-4 h-4 mr-1" />
            Event Contact Email
          </label>
          <input
            type="email"
            placeholder="event@example.com"
            value={eventContactEmail}
            onChange={(e) => onEventContactEmailChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            This email will be displayed on the event page
          </p>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Registration Settings
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <h4 className="font-semibold">Advanced Settings</h4>
            <p className="text-sm text-gray-600">
              Advanced registration features coming soon:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Custom registration questions</li>
              <li>• Waitlist management</li>
              <li>• Approval workflows</li>
              <li>• Group registration</li>
              <li>• Discount codes</li>
            </ul>
          </div>
        )}
      </div>

      {/* Registration Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Registration Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set registration deadlines to help with planning</li>
          <li>• Clear accessibility information improves inclusivity</li>
          <li>• Provide contact info for attendee questions</li>
          <li>• Consider age restrictions for safety and compliance</li>
        </ul>
      </div>
    </div>
  );
};
