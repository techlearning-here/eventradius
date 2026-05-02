import { useRef } from 'react';
import { MapPin, Video } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { FormErrors, QuickCreateData, AddressSuggestion } from './types';

interface LocationInputProps {
  eventType: QuickCreateData['event_type'];
  location: string;
  virtualEventUrl: string;
  errors: FormErrors;
  suggestions: AddressSuggestion[];
  showSuggestions: boolean;
  isSearching: boolean;
  onLocationChange: (value: string) => void;
  onVirtualUrlChange: (value: string) => void;
  onSuggestionSelect: (suggestion: AddressSuggestion) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export const LocationInput = ({
  eventType,
  location,
  virtualEventUrl,
  errors,
  suggestions,
  showSuggestions,
  isSearching,
  onLocationChange,
  onVirtualUrlChange,
  onSuggestionSelect,
  onFocus,
  onBlur,
}: LocationInputProps) => (
  <div className="space-y-2">
    <Label htmlFor="location" className="text-sm font-medium">
      {eventType === 'in_person' ? (
        <><MapPin className="w-4 h-4 inline mr-1" /> Location <span className="text-red-500">*</span></>
      ) : (
        <><Video className="w-4 h-4 inline mr-1" /> Meeting Link (Optional)</>
      )}
    </Label>
    {eventType === 'in_person' ? (
      <div className="relative">
        <Input
          id="location"
          placeholder="e.g., Central Park, New York"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className={errors.location ? 'border-red-500' : ''}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        {/* Address Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSuggestionSelect(suggestion)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors"
              >
                {suggestion.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
    ) : (
      <Input
        id="virtual_event_url"
        placeholder="Zoom/Google Meet link (auto-generated if empty)"
        value={virtualEventUrl}
        onChange={(e) => onVirtualUrlChange(e.target.value)}
      />
    )}
    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
  </div>
);
