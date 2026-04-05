import { Users, Lock, Shield } from 'lucide-react';

interface RegistrationPrivacySelectorProps {
  eventPrivacy: 'public' | 'private' | 'unlisted';
  onEventPrivacyChange: (value: 'public' | 'private' | 'unlisted') => void;
}

export const RegistrationPrivacySelector = ({
  eventPrivacy,
  onEventPrivacyChange,
}: RegistrationPrivacySelectorProps) => {
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

  return (
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
  );
};
