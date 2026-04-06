import { WIZARD_SECTIONS } from './wizardConfig';

interface SidebarNavigationProps {
  currentSectionIndex: number;
  currentSubStepIndex: number;
  onSubStepChange: (sectionIndex: number, subStepIndex: number) => void;
  isSubStepComplete: (subStepId: string) => boolean;
}

export const SidebarNavigation = ({ 
  currentSectionIndex, 
  currentSubStepIndex, 
  onSubStepChange,
  isSubStepComplete 
}: SidebarNavigationProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h4>
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
                onClick={() => onSubStepChange(sectionIndex, subStepIndex)}
                className={`w-full text-left p-2 rounded text-sm transition-colors mb-1 ${
                  isCurrent 
                    ? 'bg-blue-500 text-blue-100 font-medium' 
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
  );
};
