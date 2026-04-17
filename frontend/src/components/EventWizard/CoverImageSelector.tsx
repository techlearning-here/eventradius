import { useState, useRef } from 'react';
import { Upload, ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CoverImageGallery } from './CoverImageGallery';
import { COVER_IMAGES } from '@/config/coverImages';

interface CoverImageSelectorProps {
  selectedImageUrl: string | null;
  onImageSelect: (url: string | null) => void;
  onImageUpload: (file: File) => void;
  eventCategory?: string;
  eventType?: 'online' | 'in_person' | 'hybrid';
}

export const CoverImageSelector = ({
  selectedImageUrl,
  onImageSelect,
  onImageUpload,
  eventCategory,
  eventType = 'in_person'
}: CoverImageSelectorProps) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    
    // Notify parent
    onImageUpload(file);
    toast.success('Image ready for upload');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleGallerySelect = (url: string) => {
    onImageSelect(url);
    setUploadPreview(null); // Clear any upload preview
  };

  const clearSelection = () => {
    onImageSelect(null);
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Check if current selection is from gallery
  const isGallerySelection = selectedImageUrl && COVER_IMAGES.some(img => img.url === selectedImageUrl);
  
  // Get category of selected image
  const selectedImageCategory = selectedImageUrl 
    ? COVER_IMAGES.find(img => img.url === selectedImageUrl)?.category 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-gray-600" />
        <div>
          <h3 className="text-lg font-semibold">Event Cover Image</h3>
          <p className="text-sm text-gray-600">
            Choose from our gallery or upload your own image
          </p>
        </div>
      </div>

      {/* Selected Preview (if any) */}
      {(selectedImageUrl || uploadPreview) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">
                {uploadPreview ? 'Custom Upload Ready' : 'Cover Image Selected'}
              </span>
              {selectedImageCategory && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600 capitalize">
                  {selectedImageCategory}
                </span>
              )}
            </div>
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
          
          <div className="relative w-full max-w-lg mx-auto aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <img
              src={uploadPreview || selectedImageUrl || ''}
              alt="Selected cover"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Tabs for Gallery vs Upload */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'gallery' | 'upload')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Choose from Gallery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Your Own
          </TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-4">
          <CoverImageGallery
            selectedImage={selectedImageUrl}
            onSelectImage={handleGallerySelect}
            eventCategory={eventCategory}
            eventType={eventType}
          />
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-4">
          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              )}
            >
              <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP up to 5MB
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Recommended: 1200×630px for best results
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Upload Guidelines */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Image Guidelines</h4>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>• Use high-quality images (minimum 800×450px)</li>
                <li>• Avoid text-heavy images that may be hard to read</li>
                <li>• Choose images that represent your event accurately</li>
                <li>• Ensure you have rights to use the image</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
        <span>Gallery: {COVER_IMAGES.length} free images</span>
        <span>Or upload your own</span>
      </div>
    </div>
  );
};

export default CoverImageSelector;
