import { Monitor, Users, Wifi, Calendar, Repeat, Grid3X3 } from 'lucide-react';

/**
 * EventTypeSection features documentation
 *
 * **Features**:
 * - **Event Type**: Online, In-Person, Hybrid
 * - **Event Format**: Single, Recurring, Multi-Date
 * - **Privacy Settings**: Public, Private, Unlisted
 * - **Venue Address**: Complete address for in-person and hybrid events
 * - **Online Meeting Link**: Virtual meeting URL for online and hybrid events
 * - Visual icons and descriptions
 * - Conditional field display
 * - Smart validation based on event type
 *
 * **Conditional Fields**:
 * - **In-Person Events**: Venue address (mandatory)
 * - **Online Events**: Meeting link (mandatory)
 * - **Hybrid Events**: Both venue address and meeting link (mandatory)
 */

interface EventTypeSectionProps {
  eventType: 'online' | 'in_person' | 'hybrid';
  eventFormat: 'single' | 'recurring' | 'multi_date';
  venueAddress?: string;
  // Structured venue fields
  venueStreet?: string;
  venueCity?: string;
  venueState?: string;
  venueZipCode?: string;
  venueCountry?: string;
  venueBuildingName?: string;
  onlineMeetingLink?: string;
  // Scheduling fields based on event format
  singleEventDate?: string;
  singleEventStartTime?: string;
  singleEventEndTime?: string;
  recurringEventDay?: string;
  recurringEventStartTime?: string;
  recurringEventEndTime?: string;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  recurringHasEndDate?: boolean;
  recurringDailyType?: 'all_days' | 'exclude_days';
  recurringExcludedDays?: string[];
  multiDateEvents?: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  // Timing & Registration fields
  doorsOpenTime?: string;
  registrationStartTime?: string;
  registrationEndTime?: string;
  timezone?: string;
  onEventTypeChange: (value: 'online' | 'in_person' | 'hybrid') => void;
  onEventFormatChange: (value: 'single' | 'recurring' | 'multi_date') => void;
  onVenueAddressChange: (value: string) => void;
  // Structured venue field handlers
  onVenueStreetChange: (value: string) => void;
  onVenueCityChange: (value: string) => void;
  onVenueStateChange: (value: string) => void;
  onVenueZipCodeChange: (value: string) => void;
  onVenueCountryChange: (value: string) => void;
  onVenueBuildingNameChange: (value: string) => void;
  onOnlineMeetingLinkChange: (value: string) => void;
  // Scheduling field handlers
  onSingleEventDateChange: (value: string) => void;
  onSingleEventStartTimeChange: (value: string) => void;
  onSingleEventEndTimeChange: (value: string) => void;
  onRecurringEventDayChange: (value: string) => void;
  onRecurringEventStartTimeChange: (value: string) => void;
  onRecurringEventEndTimeChange: (value: string) => void;
  onRecurringFrequencyChange: (value: 'daily' | 'weekly' | 'monthly') => void;
  onRecurringEndDateChange: (value: string) => void;
  onRecurringHasEndDateChange: (value: boolean) => void;
  onRecurringDailyTypeChange: (value: 'all_days' | 'exclude_days') => void;
  onRecurringExcludedDaysChange: (days: string[]) => void;
  onMultiDateEventsChange: (events: Array<{id: string; date: string; startTime: string; endTime: string}>) => void;
  // Timing & Registration field handlers
  onDoorsOpenTimeChange: (value: string) => void;
  onRegistrationStartTimeChange: (value: string) => void;
  onRegistrationEndTimeChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
}

export const EventTypeSection = ({
  eventType,
  eventFormat,
  venueAddress = '',
  venueStreet = '',
  venueCity = '',
  venueState = '',
  venueZipCode = '',
  venueCountry = '',
  venueBuildingName = '',
  onlineMeetingLink = '',
  // Scheduling fields
  singleEventDate = '',
  singleEventStartTime = '',
  singleEventEndTime = '',
  recurringEventDay = '',
  recurringEventStartTime = '',
  recurringEventEndTime = '',
  recurringFrequency = 'daily',
  recurringEndDate = '',
  recurringHasEndDate = false,
  recurringDailyType = 'all_days',
  recurringExcludedDays = [],
  multiDateEvents = [],
  // Timing & Registration fields
  doorsOpenTime = '',
  registrationStartTime = '',
  registrationEndTime = '',
  timezone = '',
  onEventTypeChange,
  onEventFormatChange,
  onVenueAddressChange,
  onVenueStreetChange,
  onVenueCityChange,
  onVenueStateChange,
  onVenueZipCodeChange,
  onVenueCountryChange,
  onVenueBuildingNameChange,
  onOnlineMeetingLinkChange,
  // Scheduling handlers
  onSingleEventDateChange,
  onSingleEventStartTimeChange,
  onSingleEventEndTimeChange,
  onRecurringEventDayChange,
  onRecurringEventStartTimeChange,
  onRecurringEventEndTimeChange,
  onRecurringFrequencyChange,
  onRecurringEndDateChange,
  onRecurringHasEndDateChange,
  onRecurringDailyTypeChange,
  onRecurringExcludedDaysChange,
  onMultiDateEventsChange,
  // Timing & Registration field handlers
  onDoorsOpenTimeChange,
  onRegistrationStartTimeChange,
  onRegistrationEndTimeChange,
  onTimezoneChange,
}: EventTypeSectionProps) => {
  // Helper function to get ordinal suffix for numbers
  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };
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

  const recurringFrequencies = [
    {
      id: 'daily',
      title: 'Daily',
      description: 'Every day',
      color: 'bg-green-500 border-green-600 text-white',
    },
    {
      id: 'weekly',
      title: 'Weekly',
      description: 'Every week',
      color: 'bg-indigo-500 border-indigo-600 text-white',
    },
    {
      id: 'monthly',
      title: 'Monthly',
      description: 'Every month',
      color: 'bg-purple-500 border-purple-600 text-white',
    },
  ];

  const dailyRecurrencePatterns = [
    {
      id: 'all_days',
      title: 'All 7 Days',
      description: 'Event repeats every day including weekends',
      color: 'bg-cyan-500 border-cyan-600 text-white',
    },
    {
      id: 'exclude_days',
      title: 'Exclude Specific Days',
      description: 'Event repeats on selected days only',
      color: 'bg-rose-500 border-rose-600 text-white',
    },
  ];

  const recurrenceDurations = [
    {
      id: 'indefinite',
      title: 'Indefinite',
      description: 'Event repeats until manually stopped',
      color: 'bg-teal-500 border-teal-600 text-white',
    },
    {
      id: 'specific_date',
      title: 'End on Specific Date',
      description: 'Event repeats until a specific date',
      color: 'bg-orange-500 border-orange-600 text-white',
    },
  ];

  const weekDays = [
    { id: 'monday', label: 'Monday', color: 'bg-blue-500 border-blue-600 text-white' },
    { id: 'tuesday', label: 'Tuesday', color: 'bg-green-500 border-green-600 text-white' },
    { id: 'wednesday', label: 'Wednesday', color: 'bg-yellow-500 border-yellow-600 text-white' },
    { id: 'thursday', label: 'Thursday', color: 'bg-purple-500 border-purple-600 text-white' },
    { id: 'friday', label: 'Friday', color: 'bg-pink-500 border-pink-600 text-white' },
    { id: 'saturday', label: 'Saturday', color: 'bg-orange-500 border-orange-600 text-white' },
    { id: 'sunday', label: 'Sunday', color: 'bg-red-500 border-red-600 text-white' },
  ];

  return (
    <div className="space-y-8">
      {/* Step 1: Event Type Selection */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
            1
          </div>
          <h3 className="text-xl font-bold text-gray-900">Event Type <span className="text-red-500">*</span></h3>
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
                    onEventTypeChange(type.id as 'online' | 'in_person' | 'hybrid');
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`p-4 border-2 rounded-lg text-left transition-all cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                    eventType === type.id
                      ? `${type.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`w-6 h-6 ${eventType === type.id ? 'text-black' : 'text-current'}`} />
                    <span className={`font-semibold ${eventType === type.id ? 'text-black' : 'text-current'}`}>{type.title}</span>
                  </div>
                  <p className={`text-sm flex-1 ${eventType === type.id ? 'text-black' : 'text-current'}`}>{type.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Conditional Fields Based on Event Type */}
      <div className="space-y-6">
        {/* Venue Address for In-Person and Hybrid Events */}
        {(eventType === 'in_person' || eventType === 'hybrid') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                1a
              </div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-1">Venue Address <span className="text-red-500">*</span></h3>
            </div>
            <p className="text-gray-600 font-medium mb-6">
              {eventType === 'hybrid'
                ? 'Provide the physical venue address for in-person attendees'
                : 'Provide the complete address where your event will take place'
              }
            </p>
            <div className="space-y-3">
              {/* Building Name (Optional) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Building Name <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Convention Center, Tower Building, Suite 200"
                  className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={venueBuildingName}
                  onChange={(e) => onVenueBuildingNameChange(e.target.value)}
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  value={venueStreet}
                  onChange={(e) => onVenueStreetChange(e.target.value)}
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="New York"
                    className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={venueCity}
                    onChange={(e) => onVenueCityChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="NY"
                    className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={venueState}
                    onChange={(e) => onVenueStateChange(e.target.value)}
                  />
                </div>
              </div>

              {/* ZIP Code and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    ZIP/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="10001"
                    className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={venueZipCode}
                    onChange={(e) => onVenueZipCodeChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="United States"
                    className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    value={venueCountry}
                    onChange={(e) => onVenueCountryChange(e.target.value)}
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                📍 This address will be displayed to attendees to help them find your event location.
              </p>
            </div>
          </div>
        )}

        {/* Online Meeting Link for Online and Hybrid Events */}
        {(eventType === 'online' || eventType === 'hybrid') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-purple-200">
                {eventType === 'hybrid' ? '1b' : '1a'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Online Meeting Link {eventType === 'online' && <span className="text-red-500">*</span>}
              </h3>
            </div>
            <p className="text-gray-600 font-medium mb-6">
              {eventType === 'hybrid'
                ? 'Provide the virtual meeting link for online attendees'
                : 'Provide the meeting link where attendees can join your virtual event'
              }
            </p>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://zoom.us/j/123456789 or https://teams.microsoft.com/..."
                className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-md p-3 placeholder:text-gray-400 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={onlineMeetingLink}
                onChange={(e) => onOnlineMeetingLinkChange(e.target.value)}
              />
              <p className="text-sm text-gray-500 bg-purple-50 p-3 rounded-xl border border-purple-100">
                🔗 {eventType === 'hybrid'
                  ? 'This link will be shared with virtual attendees. Make sure it\'s accessible and tested.'
                  : 'This link will be shared with all attendees. Test it beforehand to ensure it works properly.'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Event Format Selection */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-orange-200">
            2
          </div>
          <h3 className="text-xl font-bold text-gray-900">Event Format <span className="text-red-500">*</span></h3>
        </div>
        <p className="text-gray-600 font-medium mb-6">
          Define the schedule structure of your event
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
                    onEventFormatChange(format.id as 'single' | 'recurring' | 'multi_date');
                  }}
                  className="sr-only peer"
                />
                <div
                  className={`p-4 border-2 rounded-lg text-left transition-all cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                    eventFormat === format.id
                      ? `${format.color} border-current`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`w-6 h-6 ${eventFormat === format.id ? 'text-black' : 'text-current'}`} />
                    <span className={`font-semibold ${eventFormat === format.id ? 'text-black' : 'text-current'}`}>{format.title}</span>
                  </div>
                  <p className={`text-sm flex-1 ${eventFormat === format.id ? 'text-black' : 'text-current'}`}>{format.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Conditional Scheduling Fields Based on Event Format */}
      <div className="space-y-6">
        {/* Single Event Scheduling */}
        {eventFormat === 'single' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-orange-200">
                2a
              </div>
              <h3 className="text-xl font-bold text-gray-900">Event Date & Time <span className="text-red-500">*</span></h3>
            </div>
            <p className="text-gray-600 font-medium mb-6">Set the specific date and time for your single event</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={singleEventDate}
                  onChange={(e) => onSingleEventDateChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={singleEventStartTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    onSingleEventStartTimeChange(newStartTime);
                    // Auto-calculate end time as start time + 1 hour
                    if (newStartTime) {
                      const [hours, minutes] = newStartTime.split(':').map(Number);
                      const endHours = (hours + 1) % 24;
                      const endTimeStr = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                      onSingleEventEndTimeChange(endTimeStr);
                    }
                  }}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={singleEventEndTime}
                  onChange={(e) => {
                    const newEndTime = e.target.value;
                    // Validation: end time must be after start time (when same date)
                    if (singleEventStartTime && newEndTime && newEndTime <= singleEventStartTime) {
                      // Allow the change but it will show error styling
                    }
                    onSingleEventEndTimeChange(newEndTime);
                  }}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-black bg-white ${
                    singleEventStartTime && singleEventEndTime && singleEventEndTime <= singleEventStartTime
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:ring-blue-500'
                  }`}
                />
                {singleEventStartTime && singleEventEndTime && singleEventEndTime <= singleEventStartTime && (
                  <p className="text-red-500 text-xs mt-1">End time must be after start time</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Timezone <span className="text-red-500">*</span></label>
                <select
                  value={timezone}
                  onChange={(e) => onTimezoneChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                >
                  <option value="">-- Select --</option>
                  <optgroup label="North America">
                    <option value="America/New_York">ET - New York</option>
                    <option value="America/Chicago">CT - Chicago</option>
                    <option value="America/Denver">MT - Denver</option>
                    <option value="America/Los_Angeles">PT - Los Angeles</option>
                  </optgroup>
                  <optgroup label="Europe">
                    <option value="Europe/London">GMT - London</option>
                    <option value="Europe/Paris">CET - Paris</option>
                    <option value="Europe/Berlin">CET - Berlin</option>
                  </optgroup>
                  <optgroup label="Asia">
                    <option value="Asia/Dubai">GST - Dubai</option>
                    <option value="Asia/Mumbai">IST - Mumbai</option>
                    <option value="Asia/Singapore">SGT - Singapore</option>
                    <option value="Asia/Tokyo">JST - Tokyo</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="UTC">UTC</option>
                    <option value="Australia/Sydney">AET - Sydney</option>
                    <option value="Pacific/Auckland">NZT - Auckland</option>
                  </optgroup>
                </select>
              </div>
            </div>
            {timezone && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                <span className="font-medium">Selected Timezone:</span> {timezone}
              </div>
            )}
          </div>
        )}

        {/* Recurring Event Scheduling */}
        {eventFormat === 'recurring' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-200">
                2a
              </div>
              <h3 className="text-xl font-bold text-gray-900">Recurring Schedule <span className="text-red-500">*</span></h3>
            </div>
            <p className="text-gray-600 font-medium mb-6">Set the day, time, and frequency for your recurring event</p>

            {/* Frequency Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">Repeats <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-4">
          {recurringFrequencies.map((frequency) => (
            <label key={frequency.id} className="relative cursor-pointer">
              <input
                type="radio"
                name="recurring-frequency"
                value={frequency.id}
                checked={recurringFrequency === frequency.id}
                onChange={(e) => onRecurringFrequencyChange(frequency.id as 'daily' | 'weekly' | 'monthly')}
                className="sr-only peer"
              />
              <div
                className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                  recurringFrequency === frequency.id
                    ? `${frequency.color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`font-semibold ${recurringFrequency === frequency.id ? 'text-black' : 'text-current'}`}>
                  {frequency.title}
                </div>
                <div className={`text-sm ${recurringFrequency === frequency.id ? 'text-black' : 'text-current'}`}>
                  {frequency.description}
                </div>
              </div>
            </label>
          ))}
              </div>
            </div>

            {/* Day and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recurringFrequency !== 'daily' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Day of {recurringFrequency === 'weekly' ? 'Week' : 'Month'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={recurringEventDay}
                    onChange={(e) => onRecurringEventDayChange(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  >
                    {recurringFrequency === 'weekly' ? (
                      <>
                        <option value="">Select day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </>
                    ) : (
                      <>
                        <option value="">Select day</option>
                        {Array.from({length: 31}, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}{getOrdinalSuffix(i + 1)}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )}
              <div className={recurringFrequency === 'daily' ? 'md:col-span-1' : ''}>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={recurringEventStartTime}
                  onChange={(e) => onRecurringEventStartTimeChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                />
              </div>
              <div className={recurringFrequency === 'daily' ? 'md:col-span-1' : ''}>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Time <span className="text-red-500">*</span></label>
                <input
                  type="time"
                  value={recurringEventEndTime}
                  onChange={(e) => onRecurringEventEndTimeChange(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                />
              </div>
            </div>

            {/* Daily Recurrence Options */}
            {recurringFrequency === 'daily' && (
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Daily Recurrence Pattern <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dailyRecurrencePatterns.map((pattern) => (
                    <label key={pattern.id} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="daily-recurrence-type"
                        value={pattern.id}
                        checked={recurringDailyType === pattern.id}
                        onChange={() => onRecurringDailyTypeChange(pattern.id as 'all_days' | 'exclude_days')}
                        className="sr-only peer"
                      />
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                          recurringDailyType === pattern.id
                            ? `${pattern.color} border-current`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-semibold ${recurringDailyType === pattern.id ? 'text-black' : 'text-current'}`}>
                          {pattern.title}
                        </div>
                        <div className={`text-sm ${recurringDailyType === pattern.id ? 'text-black' : 'text-current'}`}>
                          {pattern.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

                {recurringDailyType === 'exclude_days' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-white mb-2">Select Days to Exclude <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {weekDays.map((day) => (
                        <label key={day.id} className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={recurringExcludedDays.includes(day.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                onRecurringExcludedDaysChange([...recurringExcludedDays, day.id]);
                              } else {
                                onRecurringExcludedDaysChange(recurringExcludedDays.filter(d => d !== day.id));
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div
                            className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all ${
                              recurringExcludedDays.includes(day.id)
                                ? `${day.color} border-current`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`text-sm font-medium ${recurringExcludedDays.includes(day.id) ? 'text-black' : 'text-current'}`}>
                              {day.label}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      📆 Select the days you want to exclude from the daily recurrence.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* End Date Options */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Recurrence Duration <span className="text-red-500">*</span></label>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recurrenceDurations.map((duration) => (
                    <label key={duration.id} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="recurrence-duration"
                        value={duration.id}
                        checked={(duration.id === 'indefinite' && !recurringHasEndDate) || (duration.id === 'specific_date' && recurringHasEndDate)}
                        onChange={() => onRecurringHasEndDateChange(duration.id === 'specific_date')}
                        className="sr-only peer"
                      />
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-200 h-full flex flex-col ${
                          (duration.id === 'indefinite' && !recurringHasEndDate) || (duration.id === 'specific_date' && recurringHasEndDate)
                            ? `${duration.color} border-current`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-semibold ${(duration.id === 'indefinite' && !recurringHasEndDate) || (duration.id === 'specific_date' && recurringHasEndDate) ? 'text-black' : 'text-current'}`}>
                          {duration.title}
                        </div>
                        <div className={`text-sm ${(duration.id === 'indefinite' && !recurringHasEndDate) || (duration.id === 'specific_date' && recurringHasEndDate) ? 'text-black' : 'text-current'}`}>
                          {duration.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {recurringHasEndDate && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => onRecurringEndDateChange(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    📅 The last occurrence of this recurring event will be on this date.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multi-Date Event Scheduling */}
        {eventFormat === 'multi_date' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-pink-200">
                2a
              </div>
              <h3 className="text-xl font-bold text-gray-900">Multiple Event Dates <span className="text-red-500">*</span></h3>
            </div>
            <p className="text-gray-600 font-medium mb-6">Add up to 7 different event dates and times</p>
            
            <div className="space-y-4">
              {multiDateEvents.map((event, index) => (
                <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Event {index + 1}</h4>
                    {multiDateEvents.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updatedEvents = multiDateEvents.filter(e => e.id !== event.id);
                          onMultiDateEventsChange(updatedEvents);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={event.date}
                        onChange={(e) => {
                          const updatedEvents = multiDateEvents.map(evt => 
                            evt.id === event.id ? { ...evt, date: e.target.value } : evt
                          );
                          onMultiDateEventsChange(updatedEvents);
                        }}
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        value={event.startTime}
                        onChange={(e) => {
                          const updatedEvents = multiDateEvents.map(evt => 
                            evt.id === event.id ? { ...evt, startTime: e.target.value } : evt
                          );
                          onMultiDateEventsChange(updatedEvents);
                        }}
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
                      <input
                        type="time"
                        value={event.endTime}
                        onChange={(e) => {
                          const updatedEvents = multiDateEvents.map(evt => 
                            evt.id === event.id ? { ...evt, endTime: e.target.value } : evt
                          );
                          onMultiDateEventsChange(updatedEvents);
                        }}
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {multiDateEvents.length < 7 && (
                <button
                  type="button"
                  onClick={() => {
                    const newEvent = {
                      id: Date.now().toString(),
                      date: '',
                      startTime: '',
                      endTime: ''
                    };
                    onMultiDateEventsChange([...multiDateEvents, newEvent]);
                  }}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  + Add Another Event Date ({multiDateEvents.length}/7)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Event Type Tips */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-amber-200">
            💡
          </div>
          <h4 className="font-bold text-gray-900 text-lg">Pro Tips</h4>
        </div>
        <ul className="space-y-3">
          {eventType === 'online' && (
            <>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-gray-700 font-medium">Test your virtual platform before the event</span>
              </li>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-gray-700 font-medium">Provide clear instructions for attendees</span>
              </li>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span className="text-gray-700 font-medium">Consider time zones for global audiences</span>
              </li>
            </>
          )}
          {eventType === 'in_person' && (
            <>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-gray-700 font-medium">Choose a venue with good accessibility</span>
              </li>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-gray-700 font-medium">Consider parking and transportation options</span>
              </li>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span className="text-gray-700 font-medium">Have a backup plan for weather issues</span>
              </li>
            </>
          )}
          {eventType === 'hybrid' && (
            <>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span className="text-gray-700 font-medium">Ensure both audiences have equal experiences</span>
              </li>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span className="text-gray-700 font-medium">Test technical setup thoroughly</span>
              </li>
              <li className="flex items-start gap-3 bg-white/70 p-3 rounded-xl">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span className="text-gray-700 font-medium">Have dedicated moderators for each format</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Step 4: Timing & Registration Settings */}
      <div className="space-y-6 border-t border-gray-200 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-200">
            4
          </div>
          <h3 className="text-xl font-bold text-gray-900">Timing & Registration</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Doors Open Time */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Doors Open Time <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="datetime-local"
              value={doorsOpenTime}
              onChange={(e) => onDoorsOpenTimeChange(e.target.value)}
              className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-xl p-3 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <p className="text-xs text-gray-500">When attendees can start entering the venue</p>
          </div>

          {/* Registration Start Time */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Registration Opens <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="datetime-local"
              value={registrationStartTime}
              onChange={(e) => onRegistrationStartTimeChange(e.target.value)}
              className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-xl p-3 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <p className="text-xs text-gray-500">When registration becomes available</p>
          </div>

          {/* Registration End Time */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Registration Closes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="datetime-local"
              value={registrationEndTime}
              onChange={(e) => onRegistrationEndTimeChange(e.target.value)}
              className="w-full text-black text-base leading-relaxed focus:outline-none bg-white border border-gray-300 rounded-xl p-3 placeholder:text-gray-400 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <p className="text-xs text-gray-500">When registration closes (defaults to event start)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
