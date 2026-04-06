import { useCallback } from 'react';
import { WIZARD_SECTIONS } from './wizardConfig';
import { EventFormData } from './EventWizard';

export const useEventWizardLogic = (
  currentSectionIndex: number,
  currentSubStepIndex: number,
  setCurrentSectionIndex: (index: number) => void,
  setCurrentSubStepIndex: (index: number) => void,
  formData: EventFormData
) => {
  const getCurrentSection = useCallback(() => WIZARD_SECTIONS[currentSectionIndex], [currentSectionIndex, WIZARD_SECTIONS]);
  
  const getCurrentSubStep = useCallback(() => {
    const currentSection = getCurrentSection();
    return currentSection.subSteps[currentSubStepIndex];
  }, [currentSectionIndex, currentSubStepIndex, getCurrentSection]);

  const getTotalSubSteps = useCallback(() => {
    return WIZARD_SECTIONS.reduce((total, section) => total + section.subSteps.length, 0);
  }, []);

  const getCurrentSubStepNumber = useCallback(() => {
    return WIZARD_SECTIONS.slice(0, currentSectionIndex)
      .reduce((total, section) => total + section.subSteps.length, 0) + currentSubStepIndex + 1;
  }, [currentSectionIndex, currentSubStepIndex]);

  const getStepProgress = useCallback(() => {
    return (getCurrentSubStepNumber() / getTotalSubSteps()) * 100;
  }, [getCurrentSubStepNumber, getTotalSubSteps]);

  const goToSubStep = useCallback((sectionIndex: number, subStepIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentSubStepIndex(subStepIndex);
  }, [setCurrentSectionIndex, setCurrentSubStepIndex]);

  const goToPreviousSubStep = useCallback(() => {
    if (currentSubStepIndex > 0) {
      setCurrentSubStepIndex(currentSubStepIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentSubStepIndex(WIZARD_SECTIONS[currentSectionIndex - 1].subSteps.length - 1);
    }
  }, [currentSectionIndex, currentSubStepIndex, getCurrentSection, setCurrentSectionIndex, setCurrentSubStepIndex]);

  const goToNextSubStep = useCallback(() => {
    const currentSection = getCurrentSection();
    if (currentSubStepIndex < currentSection.subSteps.length - 1) {
      setCurrentSubStepIndex(currentSubStepIndex + 1);
    } else if (currentSectionIndex < WIZARD_SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentSubStepIndex(0);
    }
  }, [currentSectionIndex, currentSubStepIndex, getCurrentSection, setCurrentSectionIndex, setCurrentSubStepIndex]);

  const isSubStepComplete = useCallback((subStepId: string) => {
    switch (subStepId) {
      case 'info':
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 'type': {
        const hasEventType = !!formData.event_type && !!formData.event_format;
        if (!hasEventType) return false;
        
        if (formData.event_type === 'online') {
          return !!formData.virtual_event_url?.trim();
        } else if (formData.event_type === 'in_person') {
          return !!formData.venue_street?.trim() && !!formData.venue_city?.trim() && 
                 !!formData.venue_state?.trim() && !!formData.venue_zip_code?.trim() && 
                 !!formData.venue_country?.trim();
        } else if (formData.event_type === 'hybrid') {
          return !!formData.virtual_event_url?.trim() && !!formData.venue_street?.trim() && 
                 !!formData.venue_city?.trim() && !!formData.venue_state?.trim() && 
                 !!formData.venue_zip_code?.trim() && !!formData.venue_country?.trim();
        }
        return false;
      }
      case 'datetime':
        return !!formData.start_time && !!formData.end_time &&
               (formData.event_type === 'online' ? !!formData.virtual_event_url?.trim() : !!formData.location?.trim());
      case 'contact':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [formData]);

  return {
    getCurrentSection,
    getCurrentSubStep,
    getTotalSubSteps,
    getCurrentSubStepNumber,
    getStepProgress,
    goToSubStep,
    goToPreviousSubStep,
    goToNextSubStep,
    isSubStepComplete
  };
};
