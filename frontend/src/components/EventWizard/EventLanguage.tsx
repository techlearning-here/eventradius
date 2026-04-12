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
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
          5
        </div>
        <h3 className="text-xl font-bold text-gray-900">Event Language</h3>
      </div>
      <p className="text-gray-600 mb-6 font-medium">
        Select primary language for your event
      </p>
      
      <div className="max-w-md">
        <div className="relative group">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 bg-white font-medium group-hover:border-blue-300 transition-all duration-300 shadow-sm appearance-none cursor-pointer"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="text-gray-900">
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
