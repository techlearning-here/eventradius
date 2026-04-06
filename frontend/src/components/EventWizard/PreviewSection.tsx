import { MapPin } from 'lucide-react';

interface PreviewSectionProps {
  eventName: string;
  description: string;
  location: string;
  imagePreview: string | null;
}

export const PreviewSection = ({ eventName, description, location, imagePreview }: PreviewSectionProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Event Preview</h2>
      <div className="border border-gray-200 rounded-lg p-6">
        {imagePreview && (
          <img src={imagePreview} alt="Event preview" className="w-full h-64 object-cover rounded-lg mb-4" />
        )}
        <h3 className="text-xl font-bold mb-2">{eventName || 'Event Name'}</h3>
        <p className="text-gray-600 mb-4">{description || 'Event description will appear here...'}</p>
        {location && (
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
