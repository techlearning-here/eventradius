import { useState, useCallback } from 'react';
import { WIZARD_SECTIONS } from './wizardConfig';
import { type EventFormData } from './EventWizard';

export const useEventWizard = (initialData?: Partial<EventFormData>) => {
  // Navigation state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);

  // Form data state with defaults
  const [formData, setFormData] = useState<EventFormData>({
    // Basic fields
    title: '',
    description: '',
    language: 'en',
    event_type: 'in_person',
    event_format: 'single',
    event_privacy: 'public',
    start_time: null,
    end_time: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: '',
    virtual_event_url: '',
    virtual_event_platform: '',
    
    // Advanced fields with defaults
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
    
    // Legacy fields
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

  // Helper functions
  const getCurrentSection = useCallback(() => WIZARD_SECTIONS[currentSectionIndex], [currentSectionIndex]);
  const getCurrentSubStep = useCallback(() => getCurrentSection().subSteps[currentSubStepIndex], [getCurrentSection, currentSubStepIndex]);
  const getTotalSubSteps = useCallback(() => WIZARD_SECTIONS.reduce((total, section) => total + section.subSteps.length, 0), []);
  const getCurrentSubStepNumber = useCallback(() => {
    return WIZARD_SECTIONS.slice(0, currentSectionIndex)
      .reduce((total, section) => total + section.subSteps.length, 0) + currentSubStepIndex + 1;
  }, [currentSectionIndex, currentSubStepIndex]);

  // Navigation functions
  const goToNextSubStep = useCallback(() => {
    const currentSection = getCurrentSection();
    if (currentSubStepIndex < currentSection.subSteps.length - 1) {
      setCurrentSubStepIndex(currentSubStepIndex + 1);
    } else if (currentSectionIndex < WIZARD_SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentSubStepIndex(0);
    }
  }, [currentSubStepIndex, currentSectionIndex, getCurrentSection]);

  const goToPreviousSubStep = useCallback(() => {
    if (currentSubStepIndex > 0) {
      setCurrentSubStepIndex(currentSubStepIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentSubStepIndex(WIZARD_SECTIONS[currentSectionIndex - 1].subSteps.length - 1);
    }
  }, [currentSubStepIndex, currentSectionIndex]);

  const goToSubStep = useCallback((sectionIndex: number, subStepIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentSubStepIndex(subStepIndex);
  }, []);

  // Form data functions
  const updateFormData = useCallback((updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const isSubStepComplete = useCallback((subStepId: string) => {
    switch (subStepId) {
      case 'info':
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 'type':
        return !!formData.event_type && !!formData.event_format;
      case 'datetime':
        return !!formData.start_time && !!formData.end_time &&
               (formData.event_type === 'online' ? !!formData.virtual_event_url?.trim() : !!formData.location?.trim());
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

  const canProceedToNext = useCallback(() => {
    const currentSubStepId = getCurrentSubStep().id;
    return isSubStepComplete(currentSubStepId);
  }, [getCurrentSubStep, isSubStepComplete]);

  const isLastStep = useCallback(() => {
    return currentSectionIndex === WIZARD_SECTIONS.length - 1 && 
           currentSubStepIndex === getCurrentSection().subSteps.length - 1;
  }, [currentSectionIndex, currentSubStepIndex, getCurrentSection]);

  return {
    // State
    currentSectionIndex,
    currentSubStepIndex,
    formData,
    
    // Computed values
    getCurrentSection,
    getCurrentSubStep,
    getTotalSubSteps,
    getCurrentSubStepNumber,
    isLastStep,
    
    // Navigation
    goToNextSubStep,
    goToPreviousSubStep,
    goToSubStep,
    
    // Form data
    updateFormData,
    isSubStepComplete,
    canProceedToNext,
  };
};
