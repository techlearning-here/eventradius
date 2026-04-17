import { useState, useMemo } from 'react';
import { Check, ImageIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  COVER_IMAGES, 
  COVER_IMAGE_CATEGORIES, 
  getRecommendedImagesForEvent,
  searchCoverImages,
  type CoverImageCategory 
} from '@/config/coverImages';

interface CoverImageGalleryProps {
  selectedImage: string | null;
  onSelectImage: (url: string) => void;
  eventCategory?: string;
  eventType?: string;
}

// All available categories
const ALL_CATEGORIES: CoverImageCategory[] = [
  'general', 'social', 'professional', 'arts', 'cultural', 'painting', 'photography', 'film', 'literature', 'sports', 'food', 'wellness', 'tech'
];

export const CoverImageGallery = ({ 
  selectedImage, 
  onSelectImage,
  eventCategory,
  eventType = 'in_person'
}: CoverImageGalleryProps) => {
  const [activeCategory, setActiveCategory] = useState<CoverImageCategory>(
    (eventCategory as CoverImageCategory) || 'general'
  );
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get images based on search or category
  const displayImages = useMemo(() => {
    if (searchQuery.trim()) {
      return searchCoverImages(searchQuery);
    }
    return COVER_IMAGES.filter(img => img.category === activeCategory);
  }, [searchQuery, activeCategory]);
  
  // Get recommended categories for ordering
  const recommendedCategories = useMemo(() => {
    if (eventCategory) {
      const matching = ALL_CATEGORIES.find(c => 
      COVER_IMAGE_CATEGORIES[c].recommendedFor.includes(eventCategory.toLowerCase())
      );
      if (matching) {
        return [matching, ...ALL_CATEGORIES.filter(c => c !== matching)];
      }
    }
    // Fall back to event type recommendations
    const typeCategories = getRecommendedImagesForEvent(eventType);
    const uniqueCats = [...new Set(typeCategories.map(img => img.category))];
    return uniqueCats.length > 0 ? uniqueCats : ALL_CATEGORIES;
  }, [eventCategory, eventType]);

  const displayedCategories = showAllCategories 
    ? ALL_CATEGORIES 
    : recommendedCategories.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Choose Cover Image</h3>
      </div>
      
      <p className="text-sm text-gray-600">
        Select a cover image that represents your event. Images are organized by category to help you find the perfect match.
      </p>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {displayedCategories.map((category) => {
          const { label, color } = COVER_IMAGE_CATEGORIES[category];
          const isActive = activeCategory === category;
          const count = COVER_IMAGES.filter(img => img.category === category).length;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                isActive 
                  ? 'ring-2 ring-offset-1 ring-black' 
                  : 'hover:opacity-80',
                color
              )}
            >
              {label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
        
        {!showAllCategories && recommendedCategories.length > 4 && (
          <button
            onClick={() => setShowAllCategories(true)}
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            + More
          </button>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayImages.map((image) => {
          const isSelected = selectedImage === image.url;
          
          return (
            <button
              key={image.id}
              onClick={() => onSelectImage(image.url)}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              )}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image doesn't exist yet
                  (e.target as HTMLImageElement).src = '/cover-images/general/01-community.jpg';
                }}
              />
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <div className="bg-blue-500 text-white rounded-full p-1.5">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}
              
              {/* Hover Overlay */}
              {!isSelected && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default CoverImageGallery;
