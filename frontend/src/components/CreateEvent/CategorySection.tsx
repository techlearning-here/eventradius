import { useState } from 'react';
import { Tag, DollarSign } from 'lucide-react';

interface CategorySectionProps {
  category: string;
  onCategoryChange: (value: string) => void;
  maxParticipants?: number;
  onMaxParticipantsChange: (value: number | undefined) => void;
  isPublic?: boolean;
  onIsPublicChange: (value: boolean) => void;
  price?: string;
  onPriceChange: (value: string) => void;
  tags?: string[];
  onTagsChange: (value: string[]) => void;
}

export const CategorySection = ({
  category,
  onCategoryChange,
  maxParticipants,
  onMaxParticipantsChange,
  isPublic = true,
  onIsPublicChange,
  price = '',
  onPriceChange,
  tags = [],
  onTagsChange
}: CategorySectionProps) => {
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    { id: 'conference', label: 'Conference', emoji: '🏢' },
    { id: 'workshop', label: 'Workshop', emoji: '🛠️' },
    { id: 'meetup', label: 'Meetup', emoji: '🤝' },
    { id: 'party', label: 'Party', emoji: '🎉' },
    { id: 'sports', label: 'Sports', emoji: '⚽️' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'food', label: 'Food & Drink', emoji: '🍽' },
    { id: 'art', label: 'Art & Culture', emoji: '🎨' },
    { id: 'tech', label: 'Technology', emoji: '💻' },
    { id: 'business', label: 'Business', emoji: '💼' },
    { id: 'education', label: 'Education', emoji: '📚' },
    { id: 'health', label: 'Health & Wellness', emoji: '🏃' },
    { id: 'volunteer', label: 'Volunteer', emoji: '🤝' },
    { id: 'other', label: 'Other', emoji: '📌' }
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Category & Settings</h2>
      <div className="space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Event Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full text-black text-[16px] md:text-[18px] font-medium leading-none focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Participant Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">Max Participants</label>
          <input
            type="number"
            min="1"
            max="10000"
            value={maxParticipants || ''}
            onChange={(e) => onMaxParticipantsChange(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full text-black text-[16px] md:text-[18px] font-medium leading-none focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
            placeholder="No limit"
          />
        </div>

        {/* Public/Private Toggle */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => onIsPublicChange(e.target.checked)}
              className="w-4 h-4 text-black"
            />
            Public Event
          </label>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">Price (optional)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={price}
              onChange={(e) => onPriceChange(e.target.value)}
              placeholder="0.00"
              className="w-full text-black text-[16px] md:text-[18px] font-medium leading-none focus:outline-none bg-transparent border-none p-0 pl-8 placeholder:text-[#C4C4C4]"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag and press Enter"
                className="flex-1 text-black text-[16px] md:text-[18px] font-medium leading-none focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Tags Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
            <p className="text-sm text-gray-600 mb-4">Advanced event settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};
