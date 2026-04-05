import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Save, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Import existing components
import { BasicInfo } from './BasicInfo';
import { EventTypeSection } from './EventTypeSection';
import { DateTimeSection } from './DateTimeSection';
import { LocationSection } from './LocationSection';
import { ImageUpload } from './ImageUpload';
import { RegistrationSection } from './RegistrationSection';
import { TicketingSection } from './TicketingSection';
import { AdvancedSection } from './AdvancedSection';
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
      case 'type':
        return !!formData.event_type && !!formData.event_format;
      case 'datetime':
        return !!formData.start_time && !!formData.end_time &&
               (formData.event_type === 'online' ? !!formData.virtual_event_url?.trim() : !!formData.location?.trim());
      case 'contact':
        return true; // Contact info is optional
      case 'registration':
        return true; // Optional
      case 'ticketing':
        return true; // Optional
      case 'settings':
        return true; // Optional
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
              onEventNameChange={(title) => updateFormData({ title })}
              onDescriptionChange={(description) => updateFormData({ description })}
              onIsPaidEventChange={(is_paid_event) => updateFormData({ is_paid_event })}
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
            language={formData.language}
            onEventTypeChange={(event_type) => updateFormData({ event_type })}
            onEventFormatChange={(event_format) => updateFormData({ event_format })}
            onLanguageChange={(language) => updateFormData({ language })}
          />
        );

      case 'datetime':
        return (
          <div className="space-y-8">
            <DateTimeSection
              startDate={formData.start_time}
              endDate={formData.end_time}
              startTime={formData.start_time}
              endTime={formData.end_time}
              timezone={formData.timezone}
              doorsOpenTime={formData.doors_open_time}
              registrationStartTime={formData.registration_start_time}
              registrationEndTime={formData.registration_end_time}
              onStartDateChange={(start_time) => updateFormData({ start_time })}
              onEndDateChange={(end_time) => updateFormData({ end_time })}
              onStartTimeChange={(start_time) => updateFormData({ start_time })}
              onEndTimeChange={(end_time) => updateFormData({ end_time })}
              onTimezoneChange={(timezone) => updateFormData({ timezone })}
              onDoorsOpenTimeChange={(doors_open_time) => updateFormData({ doors_open_time })}
              onRegistrationStartTimeChange={(registration_start_time) => updateFormData({ registration_start_time })}
              onRegistrationEndTimeChange={(registration_end_time) => updateFormData({ registration_end_time })}
            />
            
            <LocationSection
              location={formData.location}
              isVirtual={formData.is_virtual}
              virtualEventDetails={formData.virtual_event_details}
              onLocationChange={(location) => updateFormData({ location })}
              onIsVirtualChange={(is_virtual) => updateFormData({ is_virtual })}
              onVirtualEventDetailsChange={(virtual_event_details) => updateFormData({ virtual_event_details })}
            />
          </div>
        );

      case 'registration':
        return (
          <RegistrationSection
            eventPrivacy={formData.event_privacy}
            eventPassword={formData.event_password}
            ageRestriction={formData.age_restriction}
            accessibilityOptions={formData.accessibility_options}
            eventContactEmail={formData.event_contact_email}
            registrationStartTime={formData.registration_start_time}
            registrationEndTime={formData.registration_end_time}
            onEventPrivacyChange={(event_privacy) => updateFormData({ event_privacy })}
            onEventPasswordChange={(event_password) => updateFormData({ event_password })}
            onAgeRestrictionChange={(age_restriction) => updateFormData({ age_restriction })}
            onAccessibilityOptionsChange={(accessibility_options) => updateFormData({ accessibility_options })}
            onEventContactEmailChange={(event_contact_email) => updateFormData({ event_contact_email })}
            onRegistrationStartTimeChange={(registration_start_time) => updateFormData({ registration_start_time })}
            onRegistrationEndTimeChange={(registration_end_time) => updateFormData({ registration_end_time })}
          />
        );

      case 'ticketing':
        return (
          <TicketingSection
            ticketTypes={formData.ticket_types || []}
            onTicketTypesChange={(ticket_types) => updateFormData({ ticket_types })}
          />
        );

      case 'settings':
        return (
          <div className="space-y-8">
            <AdvancedSection
              eventWebsite={formData.event_website}
              eventContactEmail={formData.event_contact_email}
              refundPolicy={formData.refund_policy}
              customRefundPolicy={formData.custom_refund_policy}
              onEventWebsiteChange={(event_website) => updateFormData({ event_website })}
              onEventContactEmailChange={(event_contact_email) => updateFormData({ event_contact_email })}
              onRefundPolicyChange={(refund_policy) => updateFormData({ refund_policy: refund_policy as any })}
              onCustomRefundPolicyChange={(custom_refund_policy) => updateFormData({ custom_refund_policy })}
            />
            
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
          </div>
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
            <div className="mt-2 flex justify-between items-center text-xs text-black">
              <span>Step {getCurrentSubStepNumber()} of {getTotalSubSteps()}</span>
              <span className="text-black">{Math.round(getStepProgress())}% Complete</span>
            </div>
            <div className="mt-1">
              <span className="text-sm font-medium text-black">{getCurrentSection().title} - {getCurrentSubStep().title}</span>
            </div>
            <div className="text-xs text-white mt-1">
              {getCurrentSubStep().description}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Card>
              <CardContent className="p-10">
                {/* Step Header */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">
                    {getCurrentSubStep().title}
                  </h2>
                  <p className="text-white">
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
          <div className="xl:col-span-1">
            <Card className="top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-blue-600">Event Progress</h3>
                
                {/* Current Step Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      Step {getCurrentSubStepNumber()} of {getTotalSubSteps()}
                    </span>
                    <span className="text-xs text-blue-600">
                      {Math.round(getStepProgress())}%
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {getCurrentSection().title}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
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
                                ? 'bg-blue-100 text-blue-700 font-medium' 
                                : isCompleted
                                ? 'text-gray-700 hover:bg-gray-50'
                                : 'text-gray-500 hover:text-gray-600'
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
              <div className="p-6">
                <PreviewSection
                  eventName={formData.title}
                  description={formData.description}
                  location={formData.location}
                  imagePreview={formData.image_url}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
