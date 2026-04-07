import { WIZARD_SECTIONS } from './wizardConfig';

interface ProgressIndicatorProps {
  currentSectionIndex: number;
  currentSubStepIndex: number;
}

export const ProgressIndicator = ({ currentSectionIndex, currentSubStepIndex }: ProgressIndicatorProps) => {
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

  const getCurrentSection = () => WIZARD_SECTIONS[currentSectionIndex];
  const getCurrentSubStep = () => getCurrentSection().subSteps[currentSubStepIndex];

  return (
    <div className="mt-4">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getProgress()}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between items-center text-xs text-black">
        <span>Step {getCurrentSubStepNumber()} of {getTotalSubSteps()}</span>
        <span>{Math.round(getProgress())}% Complete</span>
      </div>
      <div className="mt-1">
        <span className="text-sm font-medium text-black">
          {getCurrentSection().title} - {getCurrentSubStep().title}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {getCurrentSubStep().description}
      </div>
    </div>
  );
};
