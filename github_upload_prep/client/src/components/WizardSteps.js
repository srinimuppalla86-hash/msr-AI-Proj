import React from 'react';

const steps = ['Setup', 'Fetch Issues', 'Review', 'Test Plan'];

export default function WizardSteps({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="wizard-steps">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = completedSteps.includes(index);

        return (
          <button
            key={index}
            className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted && !isActive ? 'completed' : ''}`}
            onClick={() => onStepClick(index)}
            id={`wizard-step-${index}`}
          >
            {index + 1}. {label}
          </button>
        );
      })}
    </div>
  );
}
