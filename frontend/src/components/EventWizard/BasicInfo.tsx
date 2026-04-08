import { useState } from 'react';
import { EventLanguage } from './EventLanguage';

const EVENT_CATEGORIES = [
  { id: 'kids_family', label: 'Kids & Family', icon: '👨‍👩‍👧‍👦', color: 'from-orange-400 to-amber-500' },
  { id: 'arts_culture', label: 'Arts & Culture', icon: '🎨', color: 'from-pink-400 to-rose-500' },
  { id: 'sports', label: 'Sports', icon: '⚽', color: 'from-blue-400 to-cyan-500' },
  { id: 'social', label: 'Social', icon: '🎉', color: 'from-purple-400 to-violet-500' },
  { id: 'classes', label: 'Classes', icon: '📚', color: 'from-green-400 to-emerald-500' },
  { id: 'community', label: 'Community', icon: '🤝', color: 'from-teal-400 to-cyan-500' },
];

interface BasicInfoProps {
  eventName: string;
  description: string;
  isPaidEvent: boolean;
  ticketingUrl?: string;
  language?: string;
  category?: string;
  onEventNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsPaidEventChange: (value: boolean) => void;
  onTicketingUrlChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export const BasicInfo = ({ 
  eventName, 
  description,
  isPaidEvent,
  ticketingUrl = '',
  language = '',
  category = '',
  onEventNameChange, 
  onDescriptionChange,
  onIsPaidEventChange,
  onTicketingUrlChange,
  onLanguageChange,
  onCategoryChange
}: BasicInfoProps) => {
  const MAX_DESCRIPTION_LENGTH = 2000; // Reasonable limit for event descriptions
  
  // URL validation helper
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (optional field)
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };
  
  const isTicketingUrlValid = isValidUrl(ticketingUrl);
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
      <div className="space-y-10 md:space-y-14">
        {/* Step 1: Event Name */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900">Event Name <span className="text-red-500">*</span></h3>
          </div>
          <p className="text-gray-600 mb-4 font-medium">Choose a clear, descriptive title for your event</p>
          <div className="relative group">
            <input
              type="text"
              placeholder="Enter your event name..."
              className="w-full text-gray-900 text-lg md:text-xl font-semibold leading-tight focus:outline-none bg-white border-2 border-gray-200 rounded-xl p-4 placeholder:text-gray-400 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
              value={eventName}
              onChange={(e) => onEventNameChange(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {eventName.length > 0 && <span className="text-sm font-medium text-green-500">✓</span>}
            </div>
          </div>
        </div>

        {/* Step 2: Event Category */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900">Event Category <span className="text-red-500">*</span></h3>
          </div>
          <p className="text-gray-600 mb-6 font-medium">Select a category that best describes your event. This helps event discoverers find your event.</p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {EVENT_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`p-2 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  category === cat.id
                    ? `bg-gradient-to-br ${cat.color} border-white shadow-md scale-[1.02]`
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-1">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`font-semibold text-xs ${category === cat.id ? 'text-white' : 'text-gray-700'}`}>
                    {cat.label}
                  </span>
                </div>
                {category === cat.id && (
                  <div className="mt-1 flex justify-center">
                    <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-800">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Event Cost (Free or Paid) */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900">Event Cost</h3>
          </div>
          <p className="text-gray-600 mb-6 font-medium">Choose whether your event is free or requires payment</p>
          
          <div className="grid md:grid-cols-2 gap-5">
            {/* Free Event Card */}
            <div
              onClick={() => onIsPaidEventChange(false)}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                !isPaidEvent
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-100 scale-[1.02]'
                  : 'border-gray-200 hover:border-green-300 hover:shadow-md hover:shadow-green-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  !isPaidEvent ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200' : 'bg-green-100'
                }`}>
                  <span className={`text-lg font-black transition-all ${!isPaidEvent ? 'text-white' : 'text-green-600'}`}>FREE</span>
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-1 transition-colors ${!isPaidEvent ? 'text-green-800' : 'text-gray-700'}`}>Free Event</h4>
                  <p className={`text-sm font-medium transition-colors ${!isPaidEvent ? 'text-green-600' : 'text-gray-500'}`}>No registration fee required</p>
                  <p className="text-xs text-gray-400 mt-2">Perfect for community gatherings, workshops, and meetups</p>
                </div>
              </div>
              {!isPaidEvent && (
                <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</span>
                  Selected
                </div>
              )}
            </div>
            
            {/* Paid Event Card */}
            <div
              onClick={() => onIsPaidEventChange(true)}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                isPaidEvent
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 shadow-lg shadow-blue-100 scale-[1.02]'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isPaidEvent ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200' : 'bg-blue-100'
                }`}>
                  <span className={`text-lg font-black transition-all ${isPaidEvent ? 'text-white' : 'text-blue-600'}`}>PAID</span>
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-1 transition-colors ${isPaidEvent ? 'text-blue-800' : 'text-gray-700'}`}>Paid Event</h4>
                  <p className={`text-sm font-medium transition-colors ${isPaidEvent ? 'text-blue-600' : 'text-gray-500'}`}>Requires ticket purchase for attendance</p>
                  <p className="text-xs text-gray-400 mt-2">Ideal for conferences, concerts, and professional events</p>
                </div>
              </div>
              {isPaidEvent && (
                <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-semibold">
                  <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">✓</span>
                  Selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* External Ticketing URL (shown only for paid events) */}
        {isPaidEvent && (
          <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                3a
              </div>
              <h3 className="text-xl font-bold text-gray-900">External Ticketing System</h3>
            </div>
            <p className="text-gray-600 mb-4 font-medium">Provide a link to your external ticketing system where attendees can purchase tickets</p>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ticketing URL <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative group">
                <input
                  type="url"
                  placeholder="https://your-ticketing-system.com/event-tickets"
                  className={`w-full text-gray-900 text-base leading-relaxed focus:outline-none bg-white border-2 rounded-xl p-4 placeholder:text-gray-400 transition-all duration-300 shadow-sm ${
                    !isTicketingUrlValid 
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                  value={ticketingUrl}
                  onChange={(e) => onTicketingUrlChange(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {!isTicketingUrlValid ? (
                    <span className="text-red-500">⚠️</span>
                  ) : ticketingUrl ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-gray-400">🔗</span>
                  )}
                </div>
              </div>
              {!isTicketingUrlValid && (
                <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  Please enter a valid URL starting with http:// or https://
                </p>
              )}
              <p className="text-sm text-gray-500 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                If you're using an external ticketing platform like Eventbrite, Ticketmaster, or custom solution, provide the link here. Attendees will be redirected to this URL to purchase tickets.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Event Description */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
              4
            </div>
            <h3 className="text-xl font-bold text-gray-900">Event Description <span className="text-red-500">*</span></h3>
          </div>
          <p className="text-gray-600 mb-4 font-medium">Provide a detailed description of what attendees can expect</p>
          <div className="relative group">
            <textarea
              placeholder="Describe your event in detail... What will attendees learn, experience, or gain?"
              className="w-full text-gray-900 text-base md:text-lg leading-relaxed focus:outline-none bg-white border-2 border-gray-200 rounded-xl p-4 placeholder:text-gray-400 resize-y min-h-[160px] group-hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 shadow-sm"
              rows={5}
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3 px-1">
              <span className={`text-sm font-medium ${description.length > MAX_DESCRIPTION_LENGTH * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
                {description.length} / {MAX_DESCRIPTION_LENGTH} characters
              </span>
              {description.length > MAX_DESCRIPTION_LENGTH * 0.8 && (
                <span className={`text-sm font-semibold ${description.length > MAX_DESCRIPTION_LENGTH * 0.95 ? 'text-red-500' : 'text-orange-500'}`}>
                  {description.length > MAX_DESCRIPTION_LENGTH * 0.95 ? '⚠️ Almost at limit' : 'Getting long'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Event Language */}
        <EventLanguage
          language={language || ''}
          onLanguageChange={onLanguageChange}
        />

        {/* Step 6: Event Image */}
        <div className="space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
              6
            </div>
            <h3 className="text-xl font-bold text-gray-900">Event Image</h3>
          </div>
          <p className="text-gray-600 font-medium">Upload a compelling image that represents your event</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
            <span className="text-purple-600 text-sm font-semibold">💡 Recommended: 1920×1080px</span>
          </div>
        </div>
      </div>
    </div>
  );
};
