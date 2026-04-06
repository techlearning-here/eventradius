import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Save, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Import existing components
import { BasicInfo } from './BasicInfo';
import { EventTypeSection } from './EventTypeSection';
import { ImageUpload } from './ImageUpload';
import { ReviewSection } from './ReviewSection';
import { ContactInfo } from './ContactInfo';

// Types for enhanced event data - aligned with database schema
export interface EventFormData {
  // Priority 1: Essential Fields
  title: string;
  subtitle?: string;
  summary?: string;
  description: string;
  language?: string;
  
  // Event Type & Format
  event_type: 'online' | 'in_person' | 'hybrid';
  event_format: 'single' | 'recurring' | 'multi_date';
  event_privacy: 'public' | 'private' | 'unlisted';
  is_paid_event: boolean;
  
  // Date & Time
  start_time: Date | null;
  end_time: Date | null;
  timezone?: string;
  doors_open_time?: Date | null;
  
  // Location & Venue
  location?: string;
  primary_venue_id?: string | null;
  is_virtual: boolean;
  virtual_event_details?: string;
  virtual_event_url?: string;
  virtual_event_platform?: string;
  venue_address?: string;
  // Structured venue fields
  venue_street?: string;
  venue_city?: string;
  venue_state?: string;
  venue_zip_code?: string;
  venue_country?: string;
  venue_building_name?: string;
  
  // Scheduling fields based on event format
  single_event_date?: string;
  single_event_start_time?: string;
  single_event_end_time?: string;
  recurring_event_day?: string;
  recurring_event_start_time?: string;
  recurring_event_end_time?: string;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly';
  recurring_end_date?: string;
  recurring_has_end_date?: boolean;
  recurring_daily_type?: 'all_days' | 'exclude_days';
  recurring_excluded_days?: string[];
  multi_date_events?: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
  
  // Priority 2: Important Fields
  // Registration Settings
  registration_start_time?: Date | null;
  registration_end_time?: Date | null;
  event_password?: string;
  age_restriction?: string;
  accessibility_options?: string;
  
  // Ticketing
  ticket_types?: Array<{
    name: string;
    description?: string;
    price: number;
    currency?: string;
    quantity_available?: number;
    min_per_order?: number;
    max_per_order?: number;
    sales_start_time?: Date | null;
    sales_end_time?: Date | null;
    visibility?: string;
    absorb_fees?: boolean;
    is_donation?: boolean;
    delivery_options?: string[];
  }>;
  
  // Advanced Options
  refund_policy: 'no_refunds' | 'refund_up_to_7_days' | 'refund_up_to_24_hours' | 'refund_up_to_1_hour' | 'custom';
  custom_refund_policy?: string;
  event_website?: string;
  event_contact_email?: string;
  event_contact_phone?: string;
  ticketing_website?: string;
  
  // Legacy fields for compatibility
  category?: string;
  max_participants?: number;
  tags?: string[];
  ticket_pricing_description?: string;
  
  // Media
  image_url?: string;
  image_file?: File | null;
  
  // Status
  is_public?: boolean;
  status: 'draft' | 'published';
}

interface EventWizardProps {
  initialData?: Partial<EventFormData>;
  onSave?: (data: EventFormData) => void;
  onPublish?: (data: EventFormData) => void;
}

import { WIZARD_SECTIONS } from './wizardConfig';

export const EventWizard = ({ initialData, onSave, onPublish }: EventWizardProps) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  
  const getCurrentSection = () => WIZARD_SECTIONS[currentSectionIndex];
  const getCurrentSubStep = () => getCurrentSection().subSteps[currentSubStepIndex];
  const getTotalSubSteps = () => WIZARD_SECTIONS.reduce((total, section) => total + section.subSteps.length, 0);
  const getCurrentSubStepNumber = () => {
    return WIZARD_SECTIONS.slice(0, currentSectionIndex)
      .reduce((total, section) => total + section.subSteps.length, 0) + currentSubStepIndex + 1;
  };
  const [formData, setFormData] = useState<EventFormData>({
    // Priority 1: Essential Fields
    title: '',
    description: '',
    language: 'en',
    
    // Event Type & Format - Basic defaults
    event_type: 'in_person',
    event_format: 'single',
    event_privacy: 'public',
    is_paid_event: false,
    
    // Date & Time
    start_time: null,
    end_time: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Location & Venue
    location: '',
    primary_venue_id: null,
    is_virtual: false,
    virtual_event_details: '',
    virtual_event_url: '',
    virtual_event_platform: '',
    venue_address: '',
    // Structured venue fields
    venue_street: '',
    venue_city: '',
    venue_state: '',
    venue_zip_code: '',
    venue_country: '',
    venue_building_name: '',
    
    // Scheduling fields
    single_event_date: '',
    single_event_start_time: '',
    single_event_end_time: '',
    recurring_event_day: '',
    recurring_event_start_time: '',
    recurring_event_end_time: '',
    recurring_frequency: 'daily',
    recurring_end_date: '',
    recurring_has_end_date: false,
    recurring_daily_type: 'all_days',
    recurring_excluded_days: [],
    multi_date_events: [],
    
    // Priority 2: Advanced Fields - Set sensible defaults
    subtitle: '',
    summary: '',
    doors_open_time: null,
    registration_start_time: null,
    registration_end_time: null,
    event_password: '',
    age_restriction: '',
    accessibility_options: '',
    ticket_types: [],
    refund_policy: 'no_refunds',
    custom_refund_policy: '',
    event_website: '',
    event_contact_email: '',
    ticketing_website: '',
    
    // Legacy fields for compatibility
    category: '',
    max_participants: null,
    tags: [],
    ticket_pricing_description: '',
    
    // Media
    image_url: '',
    image_file: null,
    
    // Status
    is_public: true,
    status: 'draft',
    ...initialData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.description) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draftData = { ...formData, status: 'draft' as const };
      if (onSave) {
        await onSave(draftData);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const publishData = { ...formData, status: 'published' as const };
      if (onPublish) {
        await onPublish(publishData);
      }
    } catch (error) {
      console.error('Failed to publish event:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const updateFormData = (updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const goToNextSubStep = () => {
    const currentSection = getCurrentSection();
    if (currentSubStepIndex < currentSection.subSteps.length - 1) {
      // Move to next sub-step in current section
      setCurrentSubStepIndex(currentSubStepIndex + 1);
    } else if (currentSectionIndex < WIZARD_SECTIONS.length - 1) {
      // Move to first sub-step of next section
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentSubStepIndex(0);
    }
  };

  const goToPreviousSubStep = () => {
    if (currentSubStepIndex > 0) {
      // Move to previous sub-step in current section
      setCurrentSubStepIndex(currentSubStepIndex - 1);
    } else if (currentSectionIndex > 0) {
      // Move to last sub-step of previous section
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentSubStepIndex(WIZARD_SECTIONS[currentSectionIndex - 1].subSteps.length - 1);
    }
  };

  const goToSubStep = (sectionIndex: number, subStepIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentSubStepIndex(subStepIndex);
  };

  const getStepProgress = () => {
    return (getCurrentSubStepNumber() / getTotalSubSteps()) * 100;
  };

  const isSubStepComplete = useCallback((subStepId: string) => {
    switch (subStepId) {
      case 'info':
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 'type': {
        const hasEventType = !!formData.event_type && !!formData.event_format;
        if (!hasEventType) return false;
        
        // Validate based on event type
        if (formData.event_type === 'online') {
          if (!formData.virtual_event_url?.trim()) return false;
        } else if (formData.event_type === 'in_person') {
          if (!formData.venue_street?.trim() || !formData.venue_city?.trim() || 
              !formData.venue_state?.trim() || !formData.venue_zip_code?.trim() || 
              !formData.venue_country?.trim()) return false;
        } else if (formData.event_type === 'hybrid') {
          if (!formData.virtual_event_url?.trim() || !formData.venue_street?.trim() || 
              !formData.venue_city?.trim() || !formData.venue_state?.trim() || 
              !formData.venue_zip_code?.trim() || !formData.venue_country?.trim()) return false;
        }
        
        // Validate based on event format
        if (formData.event_format === 'single') {
          return !!formData.single_event_date?.trim() && 
                 !!formData.single_event_start_time?.trim() && 
                 !!formData.single_event_end_time?.trim();
        } else if (formData.event_format === 'recurring') {
          return !!formData.recurring_event_start_time?.trim() && 
                 !!formData.recurring_event_end_time?.trim() &&
                 !!formData.recurring_frequency &&
                 (formData.recurring_frequency === 'daily' || !!formData.recurring_event_day?.trim()) &&
                 (!formData.recurring_has_end_date || !!formData.recurring_end_date?.trim()) &&
                 (formData.recurring_frequency !== 'daily' || formData.recurring_daily_type === 'all_days' || (formData.recurring_daily_type === 'exclude_days' && formData.recurring_excluded_days && formData.recurring_excluded_days.length > 0));
        } else if (formData.event_format === 'multi_date') {
          if (!formData.multi_date_events || formData.multi_date_events.length === 0) return false;
          return formData.multi_date_events.every(event => 
            !!event.date?.trim() && !!event.startTime?.trim() && !!event.endTime?.trim()
          );
        }
        return false;
      }
      case 'datetime':
        return !!formData.start_time && !!formData.end_time &&
               (formData.event_type === 'online' ? !!formData.virtual_event_url?.trim() : !!formData.location?.trim());
      case 'contact':
        return true; // Contact info is optional
      case 'review':
        return true; // Review is always complete
      default:
        return false;
    }
  }, [formData]);

  const canProceedToNext = () => {
    const currentSubStepId = getCurrentSubStep().id;
    return isSubStepComplete(currentSubStepId);
  };

  const renderSubStepContent = () => {
    const currentSubStepId = getCurrentSubStep().id;

    switch (currentSubStepId) {
      case 'info':
        return (
          <div className="space-y-8">
            <BasicInfo
              eventName={formData.title}
              description={formData.description}
              isPaidEvent={formData.is_paid_event}
              ticketingUrl={formData.ticketing_website}
              language={formData.language || ''}
              onEventNameChange={(title) => updateFormData({ title })}
              onDescriptionChange={(description) => updateFormData({ description })}
              onIsPaidEventChange={(is_paid_event) => updateFormData({ is_paid_event })}
              onTicketingUrlChange={(ticketing_website) => updateFormData({ ticketing_website })}
              onLanguageChange={(language) => updateFormData({ language })}
            />
            <div className="flex justify-center">
              <ImageUpload
                imagePreview={formData.image_url}
                onImageUpload={(file) => updateFormData({ image_file: file })}
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <ContactInfo
            contactPhone={formData.event_contact_phone || ''}
            contactEmail={formData.event_contact_email || ''}
            onContactPhoneChange={(phone) => updateFormData({ event_contact_phone: phone })}
            onContactEmailChange={(email) => updateFormData({ event_contact_email: email })}
          />
        );

      case 'type':
        return (
          <EventTypeSection
            eventType={formData.event_type}
            eventFormat={formData.event_format}
            venueAddress={formData.venue_address}
            venueStreet={formData.venue_street}
            venueCity={formData.venue_city}
            venueState={formData.venue_state}
            venueZipCode={formData.venue_zip_code}
            venueCountry={formData.venue_country}
            venueBuildingName={formData.venue_building_name}
            onlineMeetingLink={formData.virtual_event_url}
            // Scheduling fields
            singleEventDate={formData.single_event_date}
            singleEventStartTime={formData.single_event_start_time}
            singleEventEndTime={formData.single_event_end_time}
            recurringEventDay={formData.recurring_event_day}
            recurringEventStartTime={formData.recurring_event_start_time}
            recurringEventEndTime={formData.recurring_event_end_time}
            recurringFrequency={formData.recurring_frequency}
            recurringEndDate={formData.recurring_end_date}
            recurringHasEndDate={formData.recurring_has_end_date}
            recurringDailyType={formData.recurring_daily_type}
            recurringExcludedDays={formData.recurring_excluded_days || []}
            multiDateEvents={formData.multi_date_events || []}
            onEventTypeChange={(event_type) => updateFormData({ event_type })}
            onEventFormatChange={(event_format) => updateFormData({ event_format })}
            onVenueAddressChange={(venue_address) => updateFormData({ venue_address })}
            onVenueStreetChange={(venue_street) => updateFormData({ venue_street })}
            onVenueCityChange={(venue_city) => updateFormData({ venue_city })}
            onVenueStateChange={(venue_state) => updateFormData({ venue_state })}
            onVenueZipCodeChange={(venue_zip_code) => updateFormData({ venue_zip_code })}
            onVenueCountryChange={(venue_country) => updateFormData({ venue_country })}
            onVenueBuildingNameChange={(venue_building_name) => updateFormData({ venue_building_name })}
            onOnlineMeetingLinkChange={(virtual_event_url) => updateFormData({ virtual_event_url })}
            // Scheduling handlers
            onSingleEventDateChange={(single_event_date) => updateFormData({ single_event_date })}
            onSingleEventStartTimeChange={(single_event_start_time) => updateFormData({ single_event_start_time })}
            onSingleEventEndTimeChange={(single_event_end_time) => updateFormData({ single_event_end_time })}
            onRecurringEventDayChange={(recurring_event_day) => updateFormData({ recurring_event_day })}
            onRecurringEventStartTimeChange={(recurring_event_start_time) => updateFormData({ recurring_event_start_time })}
            onRecurringEventEndTimeChange={(recurring_event_end_time) => updateFormData({ recurring_event_end_time })}
            onRecurringFrequencyChange={(recurring_frequency) => updateFormData({ recurring_frequency })}
            onRecurringEndDateChange={(recurring_end_date) => updateFormData({ recurring_end_date })}
            onRecurringHasEndDateChange={(recurring_has_end_date) => updateFormData({ recurring_has_end_date })}
            onRecurringDailyTypeChange={(recurring_daily_type) => updateFormData({ recurring_daily_type })}
            onRecurringExcludedDaysChange={(recurring_excluded_days) => updateFormData({ recurring_excluded_days })}
            onMultiDateEventsChange={(multi_date_events) => updateFormData({ multi_date_events })}
          />
        );

      case 'review':
        return (
          <ReviewSection
            formData={formData}
            onEdit={(stepId) => {
              // Find the section and sub-step for the given stepId
              WIZARD_SECTIONS.forEach((section, sectionIndex) => {
                const subStepIndex = section.subSteps.findIndex(subStep => subStep.id === stepId);
                if (subStepIndex !== -1) {
                  goToSubStep(sectionIndex, subStepIndex);
                }
              });
            }}
            onPublish={handlePublish}
            isPublishing={isPublishing}
          />
        );

      default:
        return <div>Sub-step not found</div>;
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {lastSaved && (
                <Badge variant="outline" className="text-xs">
                  Saved {lastSaved.toLocaleTimeString()}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={getStepProgress()} className="h-2 bg-blue-100 [&>div]:bg-green-500" />
            <div className="mt-2 flex justify-between items-center text-xs text-gray-800">
              <span>Step {getCurrentSubStepNumber()} of {getTotalSubSteps()}</span>
              <span className="text-gray-800">{Math.round(getStepProgress())}% Complete</span>
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium text-gray-800">{getCurrentSection().title} - {getCurrentSubStep().title}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {getCurrentSubStep().description}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid xl:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-4">
            <Card>
              <CardContent className="p-10">
                {/* Step Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">
                    {getCurrentSubStep().title}
                  </h2>
                  <p className="text-gray-600">
                    {getCurrentSubStep().description}
                  </p>
                </div>

                {/* Step Content */}
                {renderSubStepContent()}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={goToPreviousSubStep}
                    disabled={currentSectionIndex === 0 && currentSubStepIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {currentSectionIndex === WIZARD_SECTIONS.length - 1 && currentSubStepIndex === getCurrentSection().subSteps.length - 1 ? (
                      <Button
                        onClick={handlePublish}
                        disabled={isPublishing || !canProceedToNext()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isPublishing ? 'Publishing...' : 'Publish Event'}
                      </Button>
                    ) : (
                      <Button
                        onClick={goToNextSubStep}
                        disabled={!canProceedToNext()}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 max-w-xs">
            <Card className="top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-black">Event Progress</h3>
                
                {/* Current Step Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">
                      Step {getCurrentSubStepNumber()} of {getTotalSubSteps()}
                    </span>
                    <span className="text-xs text-gray-800">
                      {Math.round(getStepProgress())}%
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {getCurrentSection().title}
                  </div>
                  <div className="text-xs text-gray-800 mt-1">
                    {getCurrentSubStep().title}
                  </div>
                </div>

                {/* Step Navigation */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-black mb-3">Quick Navigation</h4>
                  {WIZARD_SECTIONS.map((section, sectionIndex) => (
                    <div key={section.id} className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                        {section.title}
                      </div>
                      {section.subSteps.map((subStep, subStepIndex) => {
                        const isCurrent = sectionIndex === currentSectionIndex && subStepIndex === currentSubStepIndex;
                        const isCompleted = isSubStepComplete(subStep.id);
                        
                        return (
                          <button
                            key={subStep.id}
                            onClick={() => goToSubStep(sectionIndex, subStepIndex)}
                            className={`w-full text-left p-2 rounded text-sm transition-colors mb-1 ${
                              isCurrent 
                                ? 'bg-blue-600 text-white font-medium' 
                                : isCompleted
                                ? 'text-gray-700 hover:bg-green-600 hover:text-white'
                                : 'text-gray-500 hover:bg-green-500 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isCompleted
                                    ? 'bg-green-500'
                                    : isCurrent
                                    ? 'bg-blue-500'
                                    : 'bg-gray-300'
                                }`}
                              />
                              <span className="truncate">{subStep.title}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* AI Suggestions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <h4 className="font-semibold">AI Suggestions</h4>
                  </div>
                  <div className="text-sm text-gray-600">
                    Get AI-powered suggestions for your event title, description, and pricing.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal/Panel */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Event Preview</h3>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
              {/* Preview removed for simplified wizard */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
