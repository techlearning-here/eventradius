import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface BackgroundImageUploadProps {
  imagePreview: string | null;
  onImageUpload: (file: File) => void;
}

export const BackgroundImageUpload = ({ imagePreview, onImageUpload }: BackgroundImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(imagePreview);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    onImageUpload(file);
  };

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Background Image <span className="text-white font-normal">(Optional)</span>
        </label>
        <p className="text-xs text-white mb-3">
          Add a background image for your event detail page. Recommended size: 1920x1080px
        </p>
      </div>
      
      <label className="w-full aspect-[16/9] border border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#CECECE] transition-colors">
        {preview ? (
          <img src={preview} alt="Background preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Click to upload background image</p>
            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </label>
      
      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Remove background image
        </button>
      )}
    </div>
  );
};
