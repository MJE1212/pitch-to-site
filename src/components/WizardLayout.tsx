'use client';

import { useProject } from '@/lib/ProjectContext';
import { STEPS } from '@/lib/types';
import Link from 'next/link';

interface WizardLayoutProps {
  children: React.ReactNode;
}

export default function WizardLayout({ children }: WizardLayoutProps) {
  const { project, goToStep, resetProject } = useProject();
  const currentStep = project.currentStep;

  return (
    <div className="min-h-screen bg-white">
      {/* Header - The Engine style */}
      <header className="bg-black px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-white tracking-[0.25em]" style={{ fontWeight: 900, fontFamily: 'Arial Black, Helvetica, sans-serif' }}>THE</span>
              <span className="text-sm text-white tracking-[0.25em]" style={{ fontWeight: 900, fontFamily: 'Arial Black, Helvetica, sans-serif' }}>ENGINE</span>
            </div>
            <span className="text-white/40 text-sm mx-1">|</span>
            <span className="text-white/70 text-sm">
              Website Builder
            </span>
          </Link>
          <button
            onClick={resetProject}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Start Over
          </button>
        </div>
      </header>

      {/* Progress Bar - Light theme */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-neutral-700">
              {STEPS[currentStep - 1]?.title}
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1">
            {STEPS.map((step) => (
              <button
                key={step.number}
                onClick={() => step.number <= currentStep && goToStep(step.number)}
                disabled={step.number > currentStep}
                className={`
                  flex-1 h-2 rounded-full transition-all
                  ${step.number < currentStep ? 'bg-black cursor-pointer hover:bg-neutral-700' : ''}
                  ${step.number === currentStep ? 'bg-green-500' : ''}
                  ${step.number > currentStep ? 'bg-neutral-200 cursor-not-allowed' : ''}
                `}
                title={step.title}
              />
            ))}
          </div>

          {/* Step labels (collapsed on mobile) */}
          <div className="hidden md:flex gap-1 mt-2">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className={`
                  flex-1 text-center text-xs truncate
                  ${step.number <= currentStep ? 'text-neutral-700' : 'text-neutral-400'}
                `}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
