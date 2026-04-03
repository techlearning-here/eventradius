import { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useGooglePlacesAutocomplete } from '@/hooks/useGooglePlacesAutocomplete';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthSheet } from '@/components/AuthSheet';
import { SEOHead } from '@/components/SEOHead';
import { z } from 'zod';
import { useAuthWithBackend } from '@/hooks/useAuthWithBackend';
import { useEventActions } from '@/hooks/useEvents';
import { type EventCreate } from '@/integrations/backend/api';
import { 
  CalendarDays, 
  MapPin, 
  Image, 
  Settings, 
  Users, 
  Zap, 
  FileText, 
  Clock,
  Star,
  TrendingUp,
  Share2,
  Eye,
  Upload
} from 'lucide-react';

const eventSchema = z.object({
  eventName: z.string().trim().min(1, 'Event name is required').max(200, 'Event name must be less than 200 characters'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format (e.g., 15:00)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format (e.g., 16:00)'),
  location: z.string().trim().min(1, 'Location is required').max(300, 'Location must be less than 300 characters'),
  description: z.string().trim().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
});

const CreateEvent = () => {
  const { user } = useAuthWithBackend();
  const { createEvent } = useEventActions();
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  
  const locationInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { onPlaceSelected } = useGooglePlacesAutocomplete(locationInputRef);

  useEffect(() => {
    onPlaceSelected((place) => {
      const address = place.formatted_address || place.name || '';
      setLocation(address);
    });
  }, [onPlaceSelected]);

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

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    // Check if user is authenticated first
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Validate date fields first
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!endDate) {
      toast.error('Please select an end date');
      return;
    }
    if (!imageFile) {
      toast.error('Please add an event image');
      return;
    }

    // Validate input fields with Zod
    const validationResult = eventSchema.safeParse({
      eventName,
      startTime,
      endTime,
      location,
      description,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Validate date/time logic
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':');
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':');
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error('End date/time must be after start date/time');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create event data for backend API (backend will handle image upload)
      const eventData: EventCreate = {
        title: eventName,
        description: description,
        location: location,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        image_url: imagePreview || '', // Backend will handle image processing
        is_public: true,
      };

      // Create event using backend API
      const newEvent = await createEvent(eventData);
      
      if (newEvent) {
        toast.success('Event created successfully!');
        navigate('/organizer'); // Go to organizer dashboard
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Side panel sections
  const sidePanelSections = [
    {
      id: 'basic',
      label: 'Basic Info',
      icon: FileText,
      description: 'Event name, description, and image'
    },
    {
      id: 'datetime',
      label: 'Date & Time',
      icon: Clock,
      description: 'Schedule your event'
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      description: 'Where your event takes place'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: Settings,
      description: 'Additional settings and options'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: Eye,
      description: 'See how your event will appear'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Track event performance'
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      description: 'Promote your event'
    }
  ];

  return (
    <>
      <SEOHead 
        title="Create Event"
        description="Create and publish a new event for your community to discover and join"
      />
      <AuthSheet isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      <div className="min-h-screen bg-white">
        <Navbar />
        
        {user ? (
          <div className="flex">
            {/* Vertical Side Panel */}
            <div className="w-64 bg-black text-white p-4 min-h-screen border-r border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Event Creator
                </h3>
                <p className="text-sm text-gray-400">Tools and features for creating amazing events</p>
              </div>
              
              <nav className="space-y-1">
                {sidePanelSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
                        isActive 
                          ? 'bg-white text-black' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">{section.label}</div>
                        <div className="text-xs text-gray-400">{section.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-8 pt-4 border-t border-gray-700">
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                    <Star className="w-4 h-4 inline mr-2" />
                    Templates
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                    <Users className="w-4 h-4 inline mr-2" />
                    Collaborators
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                {/* Content based on active section */}
                {activeSection === 'basic' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
                      {/* Left: Image Upload */}
                      <div className="flex flex-col gap-3 md:gap-4">
                        <label className="w-full aspect-[4/3] border border-black bg-[#D9D9D9] flex items-center justify-center cursor-pointer hover:bg-[#CECECE] transition-colors">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Event preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-black text-[11px] font-medium uppercase tracking-wider">
                              ADD IMAGE
                            </span>
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
                            Change image
                          </button>
                        )}
                      </div>

                      {/* Right: Form Fields */}
                      <div className="space-y-4 md:space-y-6">
                        <input
                          type="text"
                          placeholder="Event name"
                          className="w-full text-black text-[32px] md:text-[48px] lg:text-[56px] font-medium leading-none mb-4 md:mb-8 focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                        />

                        <textarea
                          placeholder="Event description"
                          className="w-full text-black text-[16px] md:text-[18px] leading-rel focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4] resize-none h-24 md:h-32"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'datetime' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Date & Time</h2>
                    <div className="space-y-6">
                      {/* Start/End Date/Time Container */}
                      <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border border-black mb-4 md:mb-6">
                        <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r border-black px-2 md:px-3 py-2 md:py-3">
                          <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full"></div>
                          <span className="text-[14px] md:text-[17px] font-medium">Start</span>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r border-black focus:outline-none bg-white",
                                !startDate && "text-[#C4C4C4]"
                              )}
                            >
                              {startDate ? format(startDate, "EEE, dd MMM") : "Thu, 28 Oct"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <input
                          type="text"
                          placeholder="15:00"
                          className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>

                      {/* End Date/Time */}
                      <div className="grid grid-cols-[80px_1fr_80px] md:grid-cols-[100px_1fr_100px] gap-0 border border-black">
                        <div className="flex items-center justify-start gap-1.5 md:gap-2 border-r border-black px-2 md:px-3 py-2 md:py-3">
                          <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-black rounded-full"></div>
                          <span className="text-[14px] md:text-[17px] font-medium">End</span>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={cn(
                                "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-left border-r border-black focus:outline-none bg-white",
                                !endDate && "text-[#C4C4C4]"
                              )}
                            >
                              {endDate ? format(endDate, "EEE, dd MMM") : "Thu, 28 Oct"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <input
                          type="text"
                          placeholder="16:00"
                          className="px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'location' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Location</h2>
                    <div className="space-y-4">
                      <input
                        ref={locationInputRef}
                        type="text"
                        placeholder="Event location"
                        className="w-full text-black text-[18px] md:text-[20px] font-medium leading-none focus:outline-none bg-transparent border-none p-0 placeholder:text-[#C4C4C4]"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'advanced' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Advanced Settings</h2>
                    <p className="text-gray-500 mb-4">Advanced options coming soon...</p>
                  </div>
                )}

                {activeSection === 'preview' && (
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
                )}

                {/* Submit Button */}
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
          ) : null}
      </div>
    </>
  );
};

export default CreateEvent;
