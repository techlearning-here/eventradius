import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { AuthSheet } from '@/components/AuthSheet';
import { SidePanel } from '@/components/CreateEvent/SidePanel';
import { BasicInfo } from '@/components/CreateEvent/BasicInfo';
import { DateTimeSection } from '@/components/CreateEvent/DateTimeSection';
import { LocationSection } from '@/components/CreateEvent/LocationSection';
import { PreviewSection } from '@/components/CreateEvent/PreviewSection';
import { ImageUpload } from '@/components/CreateEvent/ImageUpload';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEventActions } from '@/hooks/useEvents';

const CreateEvent = () => {
  const { user } = useAuthWithBackend();
  const { createEvent } = useEventActions();
  
  // Form state
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!eventName || !description || !location || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Event creation logic would go here
      console.log('Creating event:', { eventName, description, location });
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <SidePanel activeSection={activeSection} onSectionChange={setActiveSection} />
        
        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {activeSection === 'basic' && (
              <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
                <ImageUpload 
                  imagePreview={imagePreview} 
                  onImageUpload={handleImageUpload} 
                />
                <BasicInfo
                  eventName={eventName}
                  description={description}
                  onEventNameChange={setEventName}
                  onDescriptionChange={setDescription}
                />
              </div>
            )}
            
            {activeSection === 'datetime' && (
              <DateTimeSection
                startDate={startDate}
                endDate={endDate}
                startTime={startTime}
                endTime={endTime}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />
            )}
            
            {activeSection === 'location' && (
              <LocationSection
                location={location}
                onLocationChange={setLocation}
              />
            )}
            
            {activeSection === 'preview' && (
              <PreviewSection
                eventName={eventName}
                description={description}
                location={location}
                imagePreview={imagePreview}
              />
            )}
            
            {activeSection === 'advanced' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Advanced Settings</h2>
                <p className="text-gray-500 mb-4">Advanced options coming soon...</p>
              </div>
            )}
            
            {/* Submit Button - always visible */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AuthSheet isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default CreateEvent;
