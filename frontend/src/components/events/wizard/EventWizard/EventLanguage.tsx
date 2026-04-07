import React from 'react';

interface EventLanguageProps {
  language?: string;
  onLanguageChange: (value: string) => void;
}

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
];

export const EventLanguage: React.FC<EventLanguageProps> = ({
  language = '',
  onLanguageChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          4
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
  );
};
