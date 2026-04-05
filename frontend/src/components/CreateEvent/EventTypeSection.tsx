import { Monitor, Users, Wifi, Calendar, Repeat, Grid3X3 } from 'lucide-react';

interface EventTypeSectionProps {
  eventType: 'online' | 'in_person' | 'hybrid';
  eventFormat: 'single' | 'recurring' | 'multi_date';
  language: string;
  onEventTypeChange: (value: 'online' | 'in_person' | 'hybrid') => void;
  onEventFormatChange: (value: 'single' | 'recurring' | 'multi_date') => void;
  onLanguageChange: (value: string) => void;
}

export const EventTypeSection = ({
  eventType,
  eventFormat,
  language,
  onEventTypeChange,
  onEventFormatChange,
  onLanguageChange,
}: EventTypeSectionProps) => {
  const eventTypes = [
    {
      id: 'in_person',
      title: 'In-Person',
      description: 'Physical venue with face-to-face interaction',
      icon: Users,
      color: 'bg-blue-500 border-blue-600 text-white',
    },
    {
      id: 'online',
      title: 'Online',
      description: 'Virtual event accessible from anywhere',
      icon: Monitor,
      color: 'bg-purple-500 border-purple-600 text-white',
    },
    {
      id: 'hybrid',
      title: 'Hybrid',
      description: 'Combination of in-person and online',
      icon: Wifi,
      color: 'bg-green-500 border-green-600 text-white',
    },
  ];

  const eventFormats = [
    {
      id: 'single',
      title: 'Single Event',
      description: 'One-time event on a specific date',
      icon: Calendar,
      color: 'bg-orange-500 border-orange-600 text-white',
    },
    {
      id: 'recurring',
      title: 'Recurring',
      description: 'Regular event that repeats (weekly, monthly)',
      icon: Repeat,
      color: 'bg-indigo-500 border-indigo-600 text-white',
    },
    {
      id: 'multi_date',
      title: 'Multi-Date',
      description: 'Event spanning multiple days',
      icon: Grid3X3,
      color: 'bg-pink-500 border-pink-600 text-white',
    },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  return (
    <div className="space-y-8">
      {/* Step 1: Event Type Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            1
          </div>
          <h3 className="text-lg font-semibold">Event Type</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {eventTypes.map((type) => {
            const Icon = type.icon;
            return (
              <label key={type.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="event-type"
                  value={type.id}
                  checked={eventType === type.id}
                  onChange={(e) => {
                    console.log('Event type selected:', type.id);
                    onEventTypeChange(type.id as any);
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`p-4 border-2 rounded-lg text-left transition-all cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                    eventType === type.id
                      ? `${type.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={eventType === type.id ? { color: 'black !important', fontWeight: 'bold' } : {}}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6" style={eventType === type.id ? { color: 'black' } : {}} />
                    <span className="font-semibold" style={eventType === type.id ? { color: 'black' } : {}}>{type.title}</span>
                  </div>
                  <p className="text-sm flex-1" style={eventType === type.id ? { color: 'black', opacity: '1' } : {}}>{type.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Step 2: Event Format Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            2
          </div>
          <h3 className="text-lg font-semibold">Event Format</h3>
        </div>
        <p className="text-white mb-6">
          Define schedule structure of your event
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {eventFormats.map((format) => {
            const Icon = format.icon;
            return (
              <label key={format.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="event-format"
                  value={format.id}
                  checked={eventFormat === format.id}
                  onChange={(e) => {
                    console.log('Event format selected:', format.id);
                    onEventFormatChange(format.id as any);
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`p-4 border-2 rounded-lg text-left transition-all cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                    eventFormat === format.id
                      ? `${format.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={eventFormat === format.id ? { color: 'black !important', fontWeight: 'bold' } : {}}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-6 h-6" style={eventFormat === format.id ? { color: 'black' } : {}} />
                    <span className="font-semibold" style={eventFormat === format.id ? { color: 'black' } : {}}>{format.title}</span>
                  </div>
                  <p className="text-sm flex-1" style={eventFormat === format.id ? { color: 'black', opacity: '1' } : {}}>{format.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Step 3: Language Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
            3
          </div>
          <h3 className="text-lg font-semibold">Event Language</h3>
        </div>
        <p className="text-white mb-6">
          Select primary language for your event
        </p>
        
        <div className="max-w-md">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-black">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 4: Event Type Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-gray-800 space-y-1">
          {eventType === 'online' && (
            <>
              <li>• Test your virtual platform before the event</li>
              <li>• Provide clear instructions for attendees</li>
              <li>• Consider time zones for global audiences</li>
            </>
          )}
          {eventType === 'in_person' && (
            <>
              <li>• Choose a venue with good accessibility</li>
              <li>• Consider parking and transportation options</li>
              <li>• Have a backup plan for weather issues</li>
            </>
          )}
          {eventType === 'hybrid' && (
            <>
              <li>• Ensure both audiences have equal experiences</li>
              <li>• Test technical setup thoroughly</li>
              <li>• Have dedicated moderators for each format</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
