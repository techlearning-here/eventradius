import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadProps {
  imagePreview: string | null;
  onImageUpload: (file: File) => void;
}

export const ImageUpload = ({ imagePreview, onImageUpload }: ImageUploadProps) => {
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
    <div className="flex flex-col gap-4">
      <label className="w-full aspect-[16/9] border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group shadow-sm overflow-hidden">
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt="Event preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Click to change image</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-gray-700 font-semibold text-lg block mb-1">
              Add Event Image
            </span>
            <p className="text-gray-500 text-sm">
              Click to upload or drag and drop
            </p>
            <p className="text-gray-400 text-xs mt-3">
              PNG, JPG up to 5MB
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

      {preview && (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Change Image
        </button>
      )}
    </div>
  );
};
