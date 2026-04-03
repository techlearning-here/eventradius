import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SEOHead } from '@/components/SEOHead';
import { AuthSheet } from '@/components/AuthSheet';
import { SidePanel } from '@/components/CreateEvent/SidePanel';
import { BasicInfo } from '@/components/CreateEvent/BasicInfo';
import { DateTimeSection } from '@/components/CreateEvent/DateTimeSection';
import { LocationSection } from '@/components/CreateEvent/LocationSection';
import { CategorySection } from '@/components/CreateEvent/CategorySection';
import { PreviewSection } from '@/components/CreateEvent/PreviewSection';
import { ImageUpload } from '@/components/CreateEvent/ImageUpload';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEventActions, type EventCreate } from '@/hooks/useEvents';

const CreateEvent = () => {
  const { user } = useAuthWithBackend();
  const { createEvent } = useEventActions();
  
  // Form state - Enhanced with all required fields
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>();
  const [isPublic, setIsPublic] = useState(true);
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
    // Comprehensive validation
    if (!eventName.trim()) {
      alert('Event name is required');
      return;
    }
    if (!description.trim()) {
      alert('Event description is required');
      return;
    }
    if (!location.trim()) {
      alert('Event location is required');
      return;
    }
    if (!startDate) {
      alert('Start date is required');
      return;
    }
    if (!endDate) {
      alert('End date is required');
      return;
    }
    if (!startTime.trim()) {
      alert('Start time is required');
      return;
    }
    if (!endTime.trim()) {
      alert('End time is required');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      alert('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData: EventCreate = {
        title: eventName,
        description: description || undefined,
        location: location || undefined,
        start_time: startDate && startTime ? new Date(`${startDate.toISOString().split('T')[0]}T${startTime}:00Z`) : undefined,
        end_time: endDate && endTime ? new Date(`${endDate.toISOString().split('T')[0]}T${endTime}:00Z`) : undefined,
        category: category || undefined,
        max_participants: maxParticipants,
        is_public: isPublic,
        price: price || undefined,
        tags: tags.length > 0 ? tags : undefined,
        image_url: imagePreview || undefined,
        status: 'published', // Auto-publish newly created events
      };

      let result;
      if (isEditing && eventId) {
        // Update existing event
        result = await createEvent(eventId, eventData);
      } else {
        // Create new event
        result = await createEvent(eventData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      alert(isEditing ? 'Event updated successfully!' : 'Event created and published successfully!');
      
      // Reset form and redirect
      if (!isEditing) {
        setEventName('');
        setDescription('');
        setLocation('');
        setStartDate(undefined);
        setEndDate(undefined);
        setStartTime('');
        setEndTime('');
        setCategory('');
        setMaxParticipants(undefined);
        setIsPublic(true);
        setPrice('');
        setTags([]);
        setImagePreview(null);
        setImageFile(null);
      }
      
      // Redirect to events page
      window.location.href = '/my-events';
    } catch (error) {
      console.error('Error creating/updating event:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (eventId: string) => {
    // Load event data for editing
    // This would typically fetch from API
    setEventId(eventId);
    setIsEditing(true);
    setActiveSection('basic');
    
    // Pre-fill form with existing event data
    // Implementation would go here
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteEvent(eventId);
      if (result.error) {
        throw new Error(result.error);
      }
      
      alert('Event deleted successfully!');
      window.location.href = '/my-events';
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex">
        <SidePanel 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          isMinimized={isSidebarMinimized}
          onMinimizeToggle={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />
        
        {/* Main Content Area */}
        <div className={`flex-1 p-8 transition-all duration-300 ${
          isSidebarMinimized ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
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
            
            {activeSection === 'category' && (
              <CategorySection
                category={category}
                onCategoryChange={setCategory}
                maxParticipants={maxParticipants}
                onMaxParticipantsChange={setMaxParticipants}
                isPublic={isPublic}
                onIsPublicChange={setIsPublic}
                price={price}
                onPriceChange={setPrice}
                tags={tags}
                onTagsChange={setTags}
              />
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
                <p className="text-gray-500 mb-4">Advanced event management features coming soon...</p>
              </div>
            )}
            
            {/* Submit Button - always visible */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
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
