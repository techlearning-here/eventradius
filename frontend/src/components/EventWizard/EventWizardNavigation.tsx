import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface EventWizardNavigationProps {
  currentSectionIndex: number;
  currentSubStepIndex: number;
  totalSubSteps: number;
  stepProgress: number;
  canPublish: boolean;
  isPublishing: boolean;
  goToPreviousSubStep: () => void;
  goToNextSubStep: () => void;
  handlePublish: () => void;
}

export const EventWizardNavigation = ({
  currentSectionIndex,
  currentSubStepIndex,
  totalSubSteps,
  stepProgress,
  canPublish,
  isPublishing,
  goToPreviousSubStep,
  goToNextSubStep,
  handlePublish,
}: EventWizardNavigationProps) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={goToPreviousSubStep}
          disabled={currentSectionIndex === 0 && currentSubStepIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-center">
          <span className="text-sm font-medium text-gray-800">
            Step {currentSectionIndex + 1} of {totalSubSteps}
          </span>
          <div className="text-xs text-gray-800 mt-1">
            {Math.round(stepProgress)}% Complete
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={canPublish ? "default" : "outline"}
          onClick={currentSectionIndex === 4 && currentSubStepIndex === 2 ? handlePublish : goToNextSubStep}
          disabled={isPublishing || !canPublish}
          className={currentSectionIndex === 4 && currentSubStepIndex === 2 ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {currentSectionIndex === 4 && currentSubStepIndex === 2 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish Event'}
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
