import { Label } from '@/components/ui/label';
import { CoverImageSelector } from '@/components/EventWizard/CoverImageSelector';
import { DEFAULT_IMAGES } from './constants';

interface CoverImageSectionProps {
  selectedImage: string;
  showSelector: boolean;
  onImageSelect: (image: string) => void;
  onToggleSelector: () => void;
}

export const CoverImageSection = ({
  selectedImage,
  showSelector,
  onImageSelect,
  onToggleSelector,
}: CoverImageSectionProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">Cover Image</Label>
    <div className="grid grid-cols-5 gap-2">
      {DEFAULT_IMAGES.map((img, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onImageSelect(img)}
          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
            selectedImage === img
              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
          }`}
        >
          <img src={img} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
          {selectedImage === img && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
    <button
      type="button"
      onClick={onToggleSelector}
      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
    >
      {showSelector ? 'Hide more options' : 'Browse more images...'}
    </button>
    {showSelector && (
      <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <CoverImageSelector
          selectedImageUrl={selectedImage}
          onImageSelect={(img) => onImageSelect(img || '')}
          onImageUpload={() => {}}
        />
      </div>
    )}
  </div>
);
