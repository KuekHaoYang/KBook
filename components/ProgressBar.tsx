
import React from 'react';
import { AppStep } from '../types';

interface ProgressBarProps {
  currentStep: AppStep;
}

const stepsConfig = [
  { id: AppStep.USER_INPUT, label: 'Topic' },
  { id: AppStep.GENERATING_OUTLINE, label: 'Outline' },
  { id: AppStep.OUTLINE_REVIEW, label: 'Review' },
  { id: AppStep.GENERATING_CHAPTERS, label: 'Write' },
  { id: AppStep.VIEW_BOOK, label: 'Read' },
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const currentIndex = stepsConfig.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress" className="my-8">
      <ol role="list" className="flex items-center justify-center space-x-2 sm:space-x-4">
        {stepsConfig.map((step, index) => (
          <li key={step.label} className="flex-1">
            {index <= currentIndex ? (
              <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-sky-500 transition-colors">
                  Step {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-200">{step.label}</span>
              </div>
            ) : (
              <div className="group flex w-full flex-col border-l-4 border-slate-700 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-slate-500 transition-colors">
                  Step {index + 1}
                </span>
                <span className="text-sm font-medium text-slate-500">{step.label}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ProgressBar;
    