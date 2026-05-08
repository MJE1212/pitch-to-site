'use client';

import { useProject } from '@/lib/ProjectContext';
import WizardLayout from '@/components/WizardLayout';
import Step1PreBuildChecklist from '@/components/steps/Step1PreBuildChecklist';
import Step2AnalyzeDeck from '@/components/steps/Step2AnalyzeDeck';
import Step3WebsitePurpose from '@/components/steps/Step3WebsitePurpose';
import Step4BrandVoice from '@/components/steps/Step4BrandVoice';
import Step5FillGaps from '@/components/steps/Step5FillGaps';
import Step6HomepageContent from '@/components/steps/Step6HomepageContent';
import Step7DesignDirection from '@/components/steps/Step7DesignDirection';
import Step8SiteStructure from '@/components/steps/Step8SiteStructure';
import Step9SpecDocument from '@/components/steps/Step9SpecDocument';
import Step10Validator from '@/components/steps/Step10Validator';
import Step11AIPrompt from '@/components/steps/Step11AIPrompt';
import Step12NextSteps from '@/components/steps/Step12NextSteps';

export default function WizardPage() {
  const { project } = useProject();
  const { currentStep } = project;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PreBuildChecklist />;
      case 2:
        return <Step2AnalyzeDeck />;
      case 3:
        return <Step3WebsitePurpose />;
      case 4:
        return <Step4BrandVoice />;
      case 5:
        return <Step5FillGaps />;
      case 6:
        return <Step6HomepageContent />;
      case 7:
        return <Step7DesignDirection />;
      case 8:
        return <Step8SiteStructure />;
      case 9:
        return <Step9SpecDocument />;
      case 10:
        return <Step10Validator />;
      case 11:
        return <Step11AIPrompt />;
      case 12:
        return <Step12NextSteps />;
      default:
        return <Step1PreBuildChecklist />;
    }
  };

  return (
    <WizardLayout>
      {renderStep()}
    </WizardLayout>
  );
}
