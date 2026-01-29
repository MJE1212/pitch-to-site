'use client';

import { useProject } from '@/lib/ProjectContext';
import WizardLayout from '@/components/WizardLayout';
import Step1AnalyzeDeck from '@/components/steps/Step1AnalyzeDeck';
import Step2WebsitePurpose from '@/components/steps/Step2WebsitePurpose';
import Step3BrandVoice from '@/components/steps/Step3BrandVoice';
import Step4FillGaps from '@/components/steps/Step4FillGaps';
import Step5HomepageContent from '@/components/steps/Step5HomepageContent';
import Step6DesignDirection from '@/components/steps/Step6DesignDirection';
import Step7SiteStructure from '@/components/steps/Step7SiteStructure';
import Step8SpecDocument from '@/components/steps/Step8SpecDocument';
import Step9AIPrompt from '@/components/steps/Step9AIPrompt';
import Step10NextSteps from '@/components/steps/Step10NextSteps';

export default function WizardPage() {
  const { project } = useProject();
  const { currentStep } = project;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1AnalyzeDeck />;
      case 2:
        return <Step2WebsitePurpose />;
      case 3:
        return <Step3BrandVoice />;
      case 4:
        return <Step4FillGaps />;
      case 5:
        return <Step5HomepageContent />;
      case 6:
        return <Step6DesignDirection />;
      case 7:
        return <Step7SiteStructure />;
      case 8:
        return <Step8SpecDocument />;
      case 9:
        return <Step9AIPrompt />;
      case 10:
        return <Step10NextSteps />;
      default:
        return <Step1AnalyzeDeck />;
    }
  };

  return (
    <WizardLayout>
      {renderStep()}
    </WizardLayout>
  );
}
