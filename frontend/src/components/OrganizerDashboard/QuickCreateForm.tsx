import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X, Sparkles, MapPin, Video, Calendar, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { CoverImageSelector } from '@/components/EventWizard/CoverImageSelector';
import { useEventActions } from '@/hooks/useEvents';
import { type RefundPolicy, type Event } from '@/integrations/backend/api';

interface QuickCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingEvent?: Event | null;
}

interface QuickCreateData {
  title: string;
  description: string;
  start_time: Date | null;
  end_time: Date | null;
  event_type: 'in_person' | 'online';
  location: string;
  virtual_event_url: string;
  image_url: string;
}

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop',
];

export const QuickCreateForm = ({ isOpen, onClose, onSuccess, editingEvent }: QuickCreateFormProps) => {
  const navigate = useNavigate();
  const { createEvent, updateEvent } = useEventActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const isEditMode = !!editingEvent;

  const [formData, setFormData] = useState<QuickCreateData>({
    title: '',
    description: '',
    start_time: null,
    end_time: null,
    event_type: 'in_person',
    location: '',
    virtual_event_url: '',
    image_url: DEFAULT_IMAGES[0],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof QuickCreateData, string>>>({});

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof QuickCreateData, string>> = {};

    if (!formData.title.trim() || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    } else if (formData.start_time < new Date()) {
      newErrors.start_time = 'Start time must be in the future';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    } else if (formData.start_time && formData.end_time <= formData.start_time) {
      newErrors.end_time = 'End time must be after start time';
    }

    if (formData.event_type === 'in_person' && !formData.location.trim()) {
      newErrors.location = 'Location is required for in-person events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: keyof QuickCreateData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editingEvent) {
        // EDIT MODE: Update existing event
        const updateData = {
          title: formData.title.trim(),
          description: formData.description?.trim(),
          location: formData.event_type === 'in_person' ? formData.location?.trim() : (formData.virtual_event_url?.trim() || 'Online Event'),
          start_time: formData.start_time?.toISOString(),
          end_time: formData.end_time?.toISOString(),
          event_type: formData.event_type,
          image_url: formData.image_url,
          virtual_event_url: formData.event_type === 'online' ? formData.virtual_event_url?.trim() : undefined,
          virtual_event_platform: formData.event_type === 'online' ? 'Zoom' : undefined,
          is_virtual: formData.event_type === 'online',
        };

        const result = await updateEvent(editingEvent.id, updateData);

        if (result) {
          toast.success(
            <div className="space-y-1">
              <p className="font-medium">Event updated! 🎉</p>
              <p className="text-xs text-gray-200">
                Quick edit saved.{' '}
                <button
                  onClick={() => navigate(`/event/${editingEvent.id}/edit`)}
                  className="underline font-medium hover:text-white"
                >
                  Full edit →
                </button>
              </p>
            </div>,
            { duration: 4000 }
          );
          onSuccess?.();
          onClose();
        }
      } else {
        // CREATE MODE: Create new event
        const eventData = {
          title: formData.title.trim(),
          description: formData.description?.trim() || `${formData.title.trim()} - Created with Quick Create`,
          location: formData.event_type === 'in_person' ? formData.location?.trim() : (formData.virtual_event_url?.trim() || 'Online Event'),
          start_time: formData.start_time?.toISOString(),
          end_time: formData.end_time?.toISOString() || new Date(formData.start_time!.getTime() + 60 * 60 * 1000).toISOString(),
          event_type: formData.event_type || 'in_person',
          event_format: 'single' as const,
          event_privacy: 'public' as const,
          is_public: true,
          is_paid_event: false,
          image_url: formData.image_url || DEFAULT_IMAGES[0],
          status: 'published' as const,
          category: 'social',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          max_participants: undefined, // Unlimited capacity (null = no limit)
          virtual_event_url: formData.event_type === 'online' ? formData.virtual_event_url?.trim() : undefined,
          virtual_event_platform: formData.event_type === 'online' ? 'Zoom' : undefined,
          // Smart defaults
          language: 'en',
          age_restriction: 'all_ages',
          refund_policy: 'no_refunds' as RefundPolicy,
          summary: 'Quick created event - enhance with more details!',
          subtitle: undefined,
          tags: ['quick-created'],
          accessibility_options: undefined,
          is_virtual: formData.event_type === 'online',
        };

        const result = await createEvent(eventData);

        if (result) {
          toast.success(
            <div className="space-y-1">
              <p className="font-medium">Event created and published! 🎉</p>
              <p className="text-xs text-gray-200">
                Created in Quick Mode.{' '}
                <button
                  onClick={() => navigate(`/event/${result.id}/edit`)}
                  className="underline font-medium hover:text-white"
                >
                  Add more details →
                </button>
              </p>
            </div>,
            { duration: 6000 }
          );
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error('Quick edit failed:', error);
      toast.error(isEditMode ? 'Failed to update event.' : 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Date to YYYY-MM-DD string (local timezone, not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse date string safely (handles both YYYY-MM-DD and potential locale formats)
  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    // Ensure dateStr is in YYYY-MM-DD format
    let formattedDate = dateStr;
    if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return new Date(`${formattedDate}T${timeStr}`);
  };

  const handleDateChange = (field: 'start_time' | 'end_time', dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return;
    
    const date = parseDateTime(dateStr, timeStr);
    handleInputChange(field, date);
    
    // Auto-fill end time 1 hour after start time when start time is set
    if (field === 'start_time') {
      const endDate = new Date(date.getTime() + 60 * 60 * 1000); // +1 hour from selected start
      handleInputChange('end_time', endDate);
    }
  };

  // Initialize form data - populate with event data in edit mode, or set defaults in create mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingEvent) {
        // Edit mode: populate with event data
        setFormData({
          title: editingEvent.title || '',
          description: editingEvent.description || '',
          start_time: editingEvent.start_time ? new Date(editingEvent.start_time) : null,
          end_time: editingEvent.end_time ? new Date(editingEvent.end_time) : null,
          event_type: editingEvent.event_type === 'online' ? 'online' : 'in_person',
          location: editingEvent.location || '',
          virtual_event_url: editingEvent.virtual_event_url || '',
          image_url: editingEvent.image_url || DEFAULT_IMAGES[0],
        });
      } else if (!formData.start_time) {
        // Create mode: set default times
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        setFormData(prev => ({
          ...prev,
          start_time: oneHourLater,
          end_time: twoHoursLater,
        }));
      }
    }
  }, [isOpen, editingEvent, isEditMode]);

  // Handle when user changes just the end time (auto-calculate end date)
  const handleEndTimeChange = (timeStr: string) => {
    if (!timeStr || !formData.start_time) return;
    
    const startDate = new Date(formData.start_time);
    const [startHours, startMinutes] = [startDate.getHours(), startDate.getMinutes()];
    const [endHours, endMinutes] = timeStr.split(':').map(Number);
    
    // Create end date based on start date (properly clone to avoid modifying startDate)
    const endDate = new Date(startDate.getTime());
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    // Smart logic: if end time is before start time, assume it's next day
    const endMinutesTotal = endHours * 60 + endMinutes;
    const startMinutesTotal = startHours * 60 + startMinutes;
    
    if (endMinutesTotal < startMinutesTotal) {
      endDate.setDate(endDate.getDate() + 1); // Next day (start date + 1, not current date + 1)
    }
    
    handleInputChange('end_time', endDate);
  };

  // Get display text for end date
  const getEndDateDisplay = () => {
    if (!formData.start_time || !formData.end_time) return 'Same day as start';
    
    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);
    
    if (endDate.getDate() !== startDate.getDate() || 
        endDate.getMonth() !== startDate.getMonth() ||
        endDate.getFullYear() !== startDate.getFullYear()) {
      return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return 'Same day as start';
  };

  if (!isOpen) return null;

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${String(oneHourLater.getHours()).padStart(2, '0')}:${String(oneHourLater.getMinutes()).padStart(2, '0')}`;
  const defaultEndTime = `${String(twoHoursLater.getHours()).padStart(2, '0')}:${String(twoHoursLater.getMinutes()).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Quick Edit' : 'Quick Create'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditMode ? 'Update key event details quickly' : 'Create an event in under 60 seconds'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Sunday Yoga in the Park"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Event Type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('event_type', 'in_person')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  formData.event_type === 'in_person'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">In-Person</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('event_type', 'online')}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                  formData.event_type === 'online'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <Video className="w-4 h-4" />
                <span className="font-medium">Online</span>
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date & Time <span className="text-red-500">*</span>
            </Label>
            
            {/* Start Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="date"
                  min={formatDateLocal(new Date())}
                  value={formData.start_time ? formatDateLocal(formData.start_time) : defaultDate}
                  onChange={(e) => {
                    const timeStr = formData.start_time 
                      ? `${String(formData.start_time.getHours()).padStart(2, '0')}:${String(formData.start_time.getMinutes()).padStart(2, '0')}`
                      : defaultTime;
                    handleDateChange('start_time', e.target.value, timeStr);
                  }}
                  className={errors.start_time ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">Start Date <span className="text-red-500">*</span></p>
              </div>
              <div>
                <Input
                  type="time"
                  value={formData.start_time 
                    ? `${String(formData.start_time.getHours()).padStart(2, '0')}:${String(formData.start_time.getMinutes()).padStart(2, '0')}`
                    : defaultTime}
                  onChange={(e) => {
                    const dateStr = formData.start_time ? formatDateLocal(formData.start_time) : defaultDate;
                    handleDateChange('start_time', dateStr, e.target.value);
                  }}
                  className={errors.start_time ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">Start Time <span className="text-red-500">*</span></p>
              </div>
            </div>
            {errors.start_time && <p className="text-xs text-red-500">{errors.start_time}</p>}
            
            {/* End Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="date"
                  min={formData.start_time ? formatDateLocal(formData.start_time) : formatDateLocal(new Date())}
                  value={formData.end_time ? formatDateLocal(formData.end_time) : defaultDate}
                  onChange={(e) => {
                    const timeStr = formData.end_time 
                      ? `${String(formData.end_time.getHours()).padStart(2, '0')}:${String(formData.end_time.getMinutes()).padStart(2, '0')}`
                      : defaultEndTime;
                    handleDateChange('end_time', e.target.value, timeStr);
                  }}
                  className={errors.end_time ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">End Date <span className="text-red-500">*</span></p>
              </div>
              <div>
                <Input
                  type="time"
                  value={formData.end_time 
                    ? `${String(formData.end_time.getHours()).padStart(2, '0')}:${String(formData.end_time.getMinutes()).padStart(2, '0')}`
                    : defaultEndTime}
                  onChange={(e) => {
                    const dateStr = formData.end_time ? formatDateLocal(formData.end_time) : defaultDate;
                    handleDateChange('end_time', dateStr, e.target.value);
                  }}
                  className={errors.end_time ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500 mt-1">End Time <span className="text-red-500">*</span></p>
              </div>
            </div>
            {errors.end_time && <p className="text-xs text-red-500">{errors.end_time}</p>}
          </div>

          {/* Location or Virtual URL */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              {formData.event_type === 'in_person' ? (
                <><MapPin className="w-4 h-4 inline mr-1" /> Location <span className="text-red-500">*</span></>
              ) : (
                <><Video className="w-4 h-4 inline mr-1" /> Meeting Link (Optional)</>
              )}
            </Label>
            {formData.event_type === 'in_person' ? (
              <Input
                id="location"
                placeholder="e.g., Central Park, New York"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={errors.location ? 'border-red-500' : ''}
              />
            ) : (
              <Input
                id="virtual_event_url"
                placeholder="Zoom/Google Meet link (auto-generated if empty)"
                value={formData.virtual_event_url}
                onChange={(e) => handleInputChange('virtual_event_url', e.target.value)}
              />
            )}
            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-gray-400">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of your event..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cover Image</Label>
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_IMAGES.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('image_url', img)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    formData.image_url === img
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                  }`}
                >
                  <img src={img} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
                  {formData.image_url === img && (
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
              onClick={() => setShowImageSelector(!showImageSelector)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {showImageSelector ? 'Hide more options' : 'Browse more images...'}
            </button>
            {showImageSelector && (
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CoverImageSelector
                  selectedImage={formData.image_url}
                  onSelect={(img) => handleInputChange('image_url', img)}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create & Publish
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-gray-500">
            Need more options? Use the{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                // The parent component can detect this and open full wizard
              }}
              className="text-emerald-600 hover:underline font-medium"
            >
              full event wizard
            </button>
            {' '}instead.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
