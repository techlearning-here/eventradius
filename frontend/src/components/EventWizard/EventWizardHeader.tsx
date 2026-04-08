import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface EventWizardHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  progress: number;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onPublishEvent: () => void;
  isPublishing: boolean;
  canPublish: boolean;
}

export const EventWizardHeader = ({
  currentStepIndex,
  totalSteps,
  progress,
  onPreviousStep,
  onNextStep,
  onPublishEvent,
  isPublishing,
  canPublish,
}: EventWizardHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex-1">
            <div className="text-center">
              <span className="text-sm text-gray-500">Step {currentStepIndex + 1} of {totalSteps}</span>
              <div className="text-xs text-gray-400 mt-1">
                {Math.round(progress)}% Complete
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={canPublish ? "default" : "outline"}
              onClick={onPublishEvent}
              disabled={!canPublish || isPublishing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPublishing ? 'Publishing...' : 'Publish Event'}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center">
          <Progress value={progress} className="flex-1" />
          <Badge variant={canPublish ? "default" : "secondary"}>
            {canPublish ? "Publishing..." : "Draft"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
