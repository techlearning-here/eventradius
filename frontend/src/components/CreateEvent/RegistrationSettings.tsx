import { Lock, Mail, Shield } from 'lucide-react';

interface RegistrationSettingsProps {
  eventPrivacy: 'public' | 'private' | 'unlisted';
  eventPassword: string;
  ageRestriction: string;
  eventContactEmail: string;
  onEventPasswordChange: (value: string) => void;
  onAgeRestrictionChange: (value: string) => void;
  onEventContactEmailChange: (value: string) => void;
}

export const RegistrationSettings = ({
  eventPrivacy,
  eventPassword,
  ageRestriction,
  eventContactEmail,
  onEventPasswordChange,
  onAgeRestrictionChange,
  onEventContactEmailChange,
}: RegistrationSettingsProps) => {
  const ageRestrictions = [
    { value: '', label: 'No age restriction' },
    { value: 'all_ages', label: 'All ages' },
    { value: '18+', label: '18+' },
    { value: '21+', label: '21+' },
    { value: '13+', label: '13+' },
    { value: '16+', label: '16+' },
    { value: 'custom', label: 'Custom restriction' },
  ];

  return (
    <div className="space-y-6">
      {/* Password Protection for Private Events */}
      {eventPrivacy === 'private' && (
        <div className="p-4 bg-gray-50 rounded-lg">
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
            Only users with the password will be able to register
          </p>
        </div>
      )}

      {/* Age Restriction */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium">Age Restriction</label>
        </div>
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
        <p className="text-xs text-gray-500 mt-1">
          Set age requirements for your event
        </p>
      </div>

      {/* Contact Email */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium">Contact Email</label>
        </div>
        <input
          type="email"
          placeholder="contact@example.com"
          value={eventContactEmail}
          onChange={(e) => onEventContactEmailChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          Email for registration-related inquiries
        </p>
      </div>
    </div>
  );
};
