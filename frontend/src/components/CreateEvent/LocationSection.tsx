import { useRef, useState } from 'react';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';

interface LocationSectionProps {
  location: string;
  isVirtual: boolean;
  virtualEventDetails?: string;
  onLocationChange: (value: string) => void;
  onIsVirtualChange: (value: boolean) => void;
  onVirtualEventDetailsChange: (value: string) => void;
}

export const LocationSection = ({ 
  location, 
  isVirtual, 
  virtualEventDetails,
  onLocationChange, 
  onIsVirtualChange, 
  onVirtualEventDetailsChange 
}: LocationSectionProps) => {
  const locationInputRef = useRef<HTMLInputElement>(null);
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);
  const [showMapPreview, setShowMapPreview] = useState(false);

  console.log('LocationSection rendered - isVirtual:', isVirtual);

  return (
    <div>
      {/* Step 4: Location */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          4
        </div>
        <h2 className="text-2xl font-bold">Location</h2>
      </div>
      
      <div className="space-y-6">
        {/* Event Type Toggle */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              a
            </div>
            <h3 className="text-lg font-semibold">Event Type</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div
              onClick={() => {
                console.log('In-Person Event card clicked');
                console.log('Current isVirtual:', isVirtual);
                onIsVirtualChange(false);
              }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                !isVirtual
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-lg">📍</div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">In-Person Event</h4>
                  <p className="text-sm text-blue-700">Physical venue location</p>
                </div>
              </div>
            </div>
            
            <div
              onClick={() => {
                console.log('Virtual Event card clicked');
                console.log('Current isVirtual:', isVirtual);
                onIsVirtualChange(true);
              }}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                isVirtual
                  ? 'bg-green-50 border-green-200 ring-2 ring-green-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-lg">💻</div>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Virtual Event</h4>
                  <p className="text-sm text-green-700">Online event platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
              b
            </div>
            <h3 className="text-lg font-semibold">
              {isVirtual ? 'Virtual Event Details' : 'Event Location'}
            </h3>
          </div>
          
          {isVirtual ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Virtual Event Details
                </label>
                <textarea
                  placeholder="Provide details about your virtual event, including:
• Platform (Zoom, Teams, Google Meet, etc.)
• Meeting link or access information
• Any special instructions for attendees
• Technical requirements or setup needed"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white h-32 resize-none"
                  value={virtualEventDetails}
                  onChange={(e) => onVirtualEventDetailsChange(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include all necessary information for attendees to join your virtual event
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Event Location
                </label>
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder="Search for a venue or address"
                  className="w-full text-black text-[18px] md:text-[20px] font-medium leading-none focus:outline-none bg-white border border-gray-200 rounded-lg p-3 placeholder:text-[#C4C4C4]"
                  value={location}
                  onChange={(e) => onLocationChange(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to search for venues and addresses
                </p>
              </div>

              {/* Map Preview */}
              {location && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        c
                      </div>
                      <h3 className="text-lg font-semibold">Location Preview</h3>
                    </div>
                    <button
                      onClick={() => setShowMapPreview(!showMapPreview)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showMapPreview ? 'Hide Map' : 'Show Map'}
                    </button>
                  </div>
                  
                  {showMapPreview && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="h-48 bg-gray-200 rounded flex items-center justify-center mb-4">
                        <div className="text-center">
                          <div className="text-gray-500 mb-2">📍</div>
                          <span className="text-gray-600">Map Preview</span>
                          <div className="text-xs text-gray-400 mt-1">
                            {location || 'Location will appear here'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <strong>Selected Location:</strong> {location}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Location Tips</h4>
          <ul className="text-sm text-gray-800 space-y-1">
            {isVirtual ? (
              <>
                <li>• Test your virtual platform before the event</li>
                <li>• Send event links to attendees in advance</li>
                <li>• Have a backup plan for technical issues</li>
                <li>• Consider time zones for global attendees</li>
              </>
            ) : (
              <>
                <li>• Choose a location that's easily accessible</li>
                <li>• Consider parking and public transport options</li>
                <li>• Ensure the venue can accommodate your expected attendance</li>
                <li>• Check for any venue-specific requirements or restrictions</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
