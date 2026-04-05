import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadProps {
  imagePreview: string | null;
  onImageUpload: (file: File) => void;
}

export const ImageUpload = ({ imagePreview, onImageUpload }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    onImageUpload(file);
  };

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Event Image <span className="text-white font-normal">(Optional)</span>
        </label>
        <p className="text-xs text-white mb-3">
          Add an image to make your event more attractive. Recommended size: 1920x1080px
        </p>
      </div>
      
      <label className="w-full aspect-[4/3] border border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#CECECE] transition-colors">
        {imagePreview ? (
          <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-black text-[11px] font-medium uppercase tracking-wider">
              ADD IMAGE
            </span>
            <p className="text-black text-[10px] mt-1 opacity-70">
              Click to upload or drag and drop
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      {imagePreview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-3 text-[13px] font-medium uppercase tracking-wider border border-black bg-white hover:bg-black hover:text-white transition-colors"
        >
          CHANGE IMAGE
        </button>
      )}
      
      {!imagePreview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-3 text-[13px] font-medium uppercase tracking-wider border border-gray-300 text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          CHOOSE IMAGE
        </button>
      )}
    </div>
  );
};
