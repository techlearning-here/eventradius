import { WIZARD_SECTIONS } from './wizardConfig';
import { type EventFormData } from './EventWizard';

interface SubStepNavigationProps {
  currentSectionIndex: number;
  currentSubStepIndex: number;
  onSubStepChange: (sectionIndex: number, subStepIndex: number) => void;
  canProceedToNext: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isPublishing?: boolean;
  isLastStep: boolean;
}

export const SubStepNavigation = ({
  currentSectionIndex,
  currentSubStepIndex,
  onSubStepChange,
  canProceedToNext,
  onNext,
  onPrevious,
  isPublishing = false,
  isLastStep
}: SubStepNavigationProps) => {
  const getCurrentSubStepNumber = () => {
    return WIZARD_SECTIONS.slice(0, currentSectionIndex)
      .reduce((total, section) => total + section.subSteps.length, 0) + currentSubStepIndex + 1;
  };

  const getTotalSubSteps = () => {
    return WIZARD_SECTIONS.reduce((total, section) => total + section.subSteps.length, 0);
  };

  const getProgress = () => {
    return (getCurrentSubStepNumber() / getTotalSubSteps()) * 100;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 gap-4">
      <button
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-2 sm:order-1"
        onClick={onPrevious}
        disabled={currentSectionIndex === 0 && currentSubStepIndex === 0}
      >
        Previous
      </button>

      <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
        {isLastStep ? (
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={isPublishing || !canProceedToNext}
          >
            {isPublishing ? 'Publishing...' : 'Publish Event'}
          </button>
        ) : (
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={!canProceedToNext}
            onClick={onNext}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
