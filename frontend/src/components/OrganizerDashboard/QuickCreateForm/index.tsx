import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useEventActions } from '@/hooks/useEvents';
import { useAddressGeocoding } from '@/hooks/useAddressGeocoding';
import { type RefundPolicy, type Event } from '@/integrations/backend/api';

import type { QuickCreateFormProps, QuickCreateData, FormErrors, CapacityTempState, AddressSuggestion } from './types';
import { DEFAULT_IMAGES } from './constants';
import { validateForm, createDefaultTimes } from './utils';
import { Header } from './Header';
import { EventTypeSelector } from './EventTypeSelector';
import { EventOptions } from './EventOptions';
import { DateTimeSection } from './DateTimeSection';
import { LocationInput } from './LocationInput';
import { CoverImageSection } from './CoverImageSection';
import { CapacityModal } from './CapacityModal';
import { PriceDialog } from './PriceDialog';
import { UrlDialog } from './UrlDialog';

export const QuickCreateForm = ({ isOpen, onClose, onSuccess, editingEvent, onDetailedEdit }: QuickCreateFormProps) => {
  const navigate = useNavigate();
  const { createEvent, updateEvent } = useEventActions();
  const { geocodeAddress } = useAddressGeocoding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [capacityTemp, setCapacityTemp] = useState<CapacityTempState>({
    enableLimit: false,
    maxParticipants: 50,
    enableWaitlist: false,
  });

  // Dialog states
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [tempPrice, setTempPrice] = useState('');
  const [tempUrl, setTempUrl] = useState('');

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const addressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    ticket_price: 0,
    ticketing_website: '',
    require_approval: false,
    max_participants: undefined,
    enable_capacity_limit: false,
    enable_waitlist: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = useCallback((field: keyof QuickCreateData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Address autocomplete using Nominatim (OpenStreetMap)
  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) return;

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data);
      setShowAddressDropdown(true);
    } catch (error) {
      console.error('Address search error:', error);
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    handleInputChange('location', value);
    // Debounced address search
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    if (value.length >= 3) {
      addressTimeoutRef.current = setTimeout(() => {
        searchAddress(value);
      }, 500);
    } else {
      setShowAddressDropdown(false);
    }
  }, [handleInputChange, searchAddress]);

  const handleLocationSuggestionSelect = useCallback((suggestion: AddressSuggestion) => {
    handleInputChange('location', suggestion.display_name);
    setShowAddressDropdown(false);
    setAddressSuggestions([]);
  }, [handleInputChange]);

  const runValidation = useCallback(() => {
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!runValidation()) {
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
          require_approval: formData.require_approval,
          enable_waitlist: formData.enable_waitlist,
        };

        const result = await updateEvent(editingEvent.id, updateData);

        if (result) {
          toast.success(
            <div className="space-y-1">
              <p className="font-medium text-inherit">Event updated! 🎉</p>
              <p className="text-xs text-inherit opacity-90">
                Quick edit saved.{' '}
                {onDetailedEdit && editingEvent && (
                  <button
                    onClick={() => {
                      onDetailedEdit(editingEvent);
                      toast.dismiss();
                    }}
                    className="underline font-medium hover:opacity-80 text-inherit"
                  >
                    Full edit →
                  </button>
                )}
              </p>
            </div>,
            { duration: 4000 }
          );
          onSuccess?.();
          onClose();
        }
      } else {
        // CREATE MODE: Create new event
        let latitude: number | undefined;
        let longitude: number | undefined;
        let geolocation_accuracy: string | undefined;

        if (formData.event_type === 'in_person' && formData.location) {
          const geocoded = await geocodeAddress({
            address: formData.location,
          });
          if (geocoded) {
            latitude = geocoded.latitude;
            longitude = geocoded.longitude;
            geolocation_accuracy = geocoded.accuracy;
          }
        }

        const eventData = {
          title: formData.title.trim(),
          description: formData.description?.trim() || `${formData.title.trim()} - Created with Quick Create`,
          location: formData.event_type === 'in_person' ? formData.location?.trim() : (formData.virtual_event_url?.trim() || 'Online Event'),
          start_time: formData.start_time?.toISOString(),
          end_time: formData.end_time?.toISOString() || new Date(formData.start_time!.getTime() + 60 * 60 * 1000).toISOString(),
          event_type: formData.event_type || 'in_person',
          latitude,
          longitude,
          geolocation_accuracy,
          event_format: 'single' as const,
          event_privacy: 'public' as const,
          is_public: true,
          is_paid_event: formData.ticket_price > 0,
          ticket_price: formData.ticket_price || 0,
          ticketing_website: formData.ticket_price > 0 ? formData.ticketing_website : undefined,
          image_url: formData.image_url || DEFAULT_IMAGES[0],
          status: 'published' as const,
          category: 'social',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          max_participants: undefined,
          virtual_event_url: formData.event_type === 'online' ? formData.virtual_event_url?.trim() : undefined,
          virtual_event_platform: formData.event_type === 'online' ? 'Zoom' : undefined,
          language: 'en',
          age_restriction: 'all_ages',
          refund_policy: 'no_refunds' as RefundPolicy,
          summary: 'Quick created event - enhance with more details!',
          subtitle: undefined,
          tags: ['quick-created'],
          accessibility_options: undefined,
          is_virtual: formData.event_type === 'online',
          require_approval: formData.require_approval,
          enable_waitlist: formData.enable_waitlist,
        };

        const result = await createEvent(eventData);

        if (result) {
          const createdEvent: Event = {
            ...result,
            start_time: result.start_time || formData.start_time?.toISOString() || new Date().toISOString(),
            end_time: result.end_time || formData.end_time?.toISOString() || new Date().toISOString(),
            location: result.location || formData.location,
            description: result.description || formData.description,
            category: result.category || 'general',
          };

          toast.success(
            <div className="space-y-1">
              <p className="font-medium text-inherit">Event created and published! 🎉</p>
              <p className="text-xs text-inherit opacity-90">
                Created in Quick Mode.{' '}
                {onDetailedEdit && (
                  <button
                    onClick={() => {
                      onDetailedEdit(createdEvent);
                      toast.dismiss();
                    }}
                    className="underline font-medium hover:opacity-80 text-inherit"
                  >
                    Add more details →
                  </button>
                )}
              </p>
            </div>,
            { duration: 6000 }
          );
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      console.error('Quick create error:', error);
      toast.error(isEditMode ? 'Failed to update event.' : 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditMode, editingEvent, createEvent, updateEvent, geocodeAddress, onSuccess, onClose, onDetailedEdit, runValidation]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingEvent) {
        setFormData({
          title: editingEvent.title || '',
          description: editingEvent.description || '',
          start_time: editingEvent.start_time ? new Date(editingEvent.start_time) : null,
          end_time: editingEvent.end_time ? new Date(editingEvent.end_time) : null,
          event_type: editingEvent.event_type === 'online' ? 'online' : 'in_person',
          location: editingEvent.location || '',
          virtual_event_url: (editingEvent as { virtual_event_url?: string }).virtual_event_url || '',
          image_url: editingEvent.image_url || DEFAULT_IMAGES[0],
          ticket_price: editingEvent.ticket_price || 0,
          ticketing_website: (editingEvent as { ticketing_website?: string }).ticketing_website || '',
          require_approval: editingEvent.require_approval || false,
          max_participants: editingEvent.max_participants,
          enable_capacity_limit: !!editingEvent.max_participants,
          enable_waitlist: (editingEvent as { enable_waitlist?: boolean }).enable_waitlist || false,
        });
      } else if (!formData.start_time) {
        const { oneHourLater, twoHoursLater } = createDefaultTimes();
        setFormData((prev) => ({
          ...prev,
          start_time: oneHourLater,
          end_time: twoHoursLater,
        }));
      }
    }
  }, [isOpen, editingEvent, isEditMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, []);

  const handleEditPrice = useCallback(() => {
    setTempPrice((formData.ticket_price ?? 0).toString());
    setShowPriceDialog(true);
  }, [formData.ticket_price]);

  const handleSavePrice = useCallback((price: number) => {
    handleInputChange('ticket_price', price);
    setShowPriceDialog(false);
  }, [handleInputChange]);

  const handleEditUrl = useCallback(() => {
    setTempUrl(formData.ticketing_website || '');
    setShowUrlDialog(true);
  }, [formData.ticketing_website]);

  const handleSaveUrl = useCallback((url: string) => {
    handleInputChange('ticketing_website', url);
    setShowUrlDialog(false);
  }, [handleInputChange]);

  const handleToggleApproval = useCallback(() => {
    handleInputChange('require_approval', !formData.require_approval);
  }, [formData.require_approval, handleInputChange]);

  const handleEditCapacity = useCallback(() => {
    setCapacityTemp({
      enableLimit: formData.enable_capacity_limit,
      maxParticipants: formData.max_participants || 50,
      enableWaitlist: formData.enable_waitlist,
    });
    setShowCapacityModal(true);
  }, [formData]);

  const handleConfirmCapacity = useCallback(() => {
    handleInputChange('enable_capacity_limit', capacityTemp.enableLimit);
    handleInputChange('max_participants', capacityTemp.enableLimit ? capacityTemp.maxParticipants : undefined);
    handleInputChange('enable_waitlist', capacityTemp.enableLimit && capacityTemp.enableWaitlist);
    setShowCapacityModal(false);
  }, [capacityTemp, handleInputChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
        <Header isEditMode={isEditMode} onClose={onClose} />

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
          <EventTypeSelector
            value={formData.event_type}
            onChange={(type) => handleInputChange('event_type', type)}
          />

          {/* Event Options */}
          <EventOptions
            formData={formData}
            onEditPrice={handleEditPrice}
            onEditUrl={handleEditUrl}
            onToggleApproval={handleToggleApproval}
            onEditCapacity={handleEditCapacity}
          />

          {/* Date & Time */}
          <DateTimeSection
            startTime={formData.start_time}
            endTime={formData.end_time}
            errors={errors}
            onStartTimeChange={(date) => handleInputChange('start_time', date)}
            onEndTimeChange={(date) => handleInputChange('end_time', date)}
          />

          {/* Location or Virtual URL */}
          <LocationInput
            eventType={formData.event_type}
            location={formData.location}
            virtualEventUrl={formData.virtual_event_url}
            errors={errors}
            suggestions={addressSuggestions}
            showSuggestions={showAddressDropdown}
            isSearching={isSearchingAddress}
            onLocationChange={handleLocationChange}
            onVirtualUrlChange={(value) => handleInputChange('virtual_event_url', value)}
            onSuggestionSelect={handleLocationSuggestionSelect}
            onFocus={() => {
              if (addressSuggestions.length > 0) {
                setShowAddressDropdown(true);
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowAddressDropdown(false), 200);
            }}
          />

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
          <CoverImageSection
            selectedImage={formData.image_url}
            showSelector={showImageSelector}
            onImageSelect={(img) => handleInputChange('image_url', img)}
            onToggleSelector={() => setShowImageSelector(!showImageSelector)}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
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
              onClick={onClose}
              className="text-emerald-600 hover:underline font-medium"
            >
              full event wizard
            </button>{' '}
            instead.
          </p>
        </CardContent>
      </Card>

      {/* Capacity Modal */}
      <CapacityModal
        isOpen={showCapacityModal}
        tempState={capacityTemp}
        onToggleLimit={() => setCapacityTemp((prev) => ({ ...prev, enableLimit: !prev.enableLimit }))}
        onMaxParticipantsChange={(value) => setCapacityTemp((prev) => ({ ...prev, maxParticipants: value }))}
        onToggleWaitlist={() => setCapacityTemp((prev) => ({ ...prev, enableWaitlist: !prev.enableWaitlist }))}
        onConfirm={handleConfirmCapacity}
      />

      {/* Price Dialog */}
      <PriceDialog
        isOpen={showPriceDialog}
        tempPrice={tempPrice}
        onTempPriceChange={setTempPrice}
        onClose={() => setShowPriceDialog(false)}
        onSave={handleSavePrice}
      />

      {/* URL Dialog */}
      <UrlDialog
        isOpen={showUrlDialog}
        tempUrl={tempUrl}
        onTempUrlChange={setTempUrl}
        onClose={() => setShowUrlDialog(false)}
        onSave={handleSaveUrl}
      />
    </div>
  );
};

export default QuickCreateForm;
