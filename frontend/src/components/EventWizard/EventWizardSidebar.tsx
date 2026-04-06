import { WIZARD_SECTIONS } from './wizardConfig';

interface EventWizardSidebarProps {
  currentSectionIndex: number;
  currentSubStepIndex: number;
  isSubStepComplete: (subStepId: string) => boolean;
  goToSubStep: (sectionIndex: number, subStepIndex: number) => void;
  getCurrentSection: () => typeof WIZARD_SECTIONS[0];
  getCurrentSubStep: () => typeof WIZARD_SECTIONS[0]['subSteps'][0];
  getStepProgress: () => number;
  getCurrentSubStepNumber: () => number;
  getTotalSubSteps: () => number;
}

export const EventWizardSidebar = ({
  currentSectionIndex,
  currentSubStepIndex,
  isSubStepComplete,
  goToSubStep,
  getCurrentSection,
  getCurrentSubStep,
  getStepProgress,
  getCurrentSubStepNumber,
  getTotalSubSteps
}: EventWizardSidebarProps) => {
  return (
    <div className="xl:col-span-1 max-w-xs">
      <div className="top-24">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
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
            <div className="text-xs text-gray-600 mt-1">
              {getCurrentSubStep().description}
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
        </div>
      </div>
    </div>
  );
};
