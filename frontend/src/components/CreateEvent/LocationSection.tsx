import { useRef } from 'react';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';

interface LocationSectionProps {
  location: string;
  onLocationChange: (value: string) => void;
}

export const LocationSection = ({ location, onLocationChange }: LocationSectionProps) => {
  const locationInputRef = useRef<HTMLInputElement>(null);
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Location</h2>
      <div className="space-y-4">
        <input
          ref={locationInputRef}
          type="text"
          placeholder="Event location"
          className="w-full text-black text-[18px] md:text-[20px] font-medium leading-none focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>
    </div>
  );
};
