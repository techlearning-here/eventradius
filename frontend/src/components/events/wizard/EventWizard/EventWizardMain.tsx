import { Card, CardContent } from '@/components/ui/card';
import { EventFormData } from './EventWizard';
import { WIZARD_SECTIONS } from './wizardConfig';
import { EventStepContent } from './EventStepContent';

interface EventWizardMainProps {
  currentSubStepId: string;
  formData: EventFormData;
  updateFormData: (updates: Partial<EventFormData>) => void;
  getCurrentSubStep: () => typeof WIZARD_SECTIONS[0]['subSteps'][0];
  getCurrentSection: () => typeof WIZARD_SECTIONS[0];
  goToSubStep: (sectionIndex: number, subStepIndex: number) => void;
}

export const EventWizardMain = ({ 
  currentSubStepId, 
  formData, 
  updateFormData, 
  getCurrentSubStep,
  getCurrentSection,
  goToSubStep
}: EventWizardMainProps) => {
  return (
    <div className="xl:col-span-4">
      <Card>
        <CardContent className="p-10">
          {/* Step Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              {getCurrentSubStep().title}
            </h2>
            <div className="text-sm text-gray-600 mb-4">
              {getCurrentSubStep().description}
            </div>
          </div>

          {/* Step Content */}
          <EventStepContent
            currentSubStepId={currentSubStepId}
            formData={formData}
            updateFormData={updateFormData}
            goToSubStep={goToSubStep}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* Previous logic */}}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={false}
              >
                Previous
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {/* Next logic */}}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={false}
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
