// Step 1: Deck Analysis
export interface DeckElement {
  name: string;
  status: 'present' | 'partial' | 'missing';
  content?: string;
}

export interface DeckAnalysis {
  elements: {
    companyName: DeckElement;
    tagline: DeckElement;
    problemStatement: DeckElement;
    solutionDescription: DeckElement;
    targetAudience: DeckElement;
    keyFeatures: DeckElement;
    howItWorks: DeckElement;
    differentiators: DeckElement;
    teamInfo: DeckElement;
    currentStatus: DeckElement;
    contactInfo: DeckElement;
  };
  rawText: string;
}

// Step 2: Website Purpose
export type CompanyStage = 'idea' | 'building' | 'beta' | 'launched';

export interface WebsitePurpose {
  primaryAudience: string[];
  primaryCTA: string;
  secondaryCTA: string;
  companyStage: CompanyStage;
  linkedInUrl?: string;
  twitterUrl?: string;
}

// Step 3: Brand Voice
export interface BrandVoice {
  oneLiner: string;
  personalityTraits: string[];
  desiredFeeling: string;
}

// Step 4: Content Gaps (filled via Q&A)
export interface ContentGaps {
  answers: Record<string, string>;
}

// Step 5: Homepage Content
export interface HomepageContent {
  hero: {
    headline: string;
    alternativeHeadlines: string[];
    subheadline: string;
    primaryCTA: string;
  };
  problem: {
    header: string;
    body: string;
  };
  solution: {
    header: string;
    body: string;
  };
  benefits: Array<{
    headline: string;
    description: string;
  }>;
  howItWorks: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  trustElements: string[];
  finalCTA: {
    headline: string;
    buttonText: string;
    supportingText: string;
  };
}

// Step 6: Design Direction
export interface DesignDirection {
  colorPalette: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    customHeadingFont?: string; // Custom uploaded font name
    customBodyFont?: string; // Custom uploaded font name
  };
  logo?: {
    fileName: string;
    dataUrl: string; // Base64 data URL for the logo
  };
  imageryStyle: string;
  avoidList: string[];
  referenceWebsites: string[];
  trustSignals: string[];
}

// Step 7: Site Structure
export interface SiteStructure {
  type: 'single-page' | 'multi-page';
  sections: string[];
  navigationItems: string[];
  footerItems: string[];
  contentToCut: string[];
}

// Step 8 & 9: Generated Documents
export interface SpecDocument {
  markdown: string;
}

export interface AIBuilderPrompt {
  prompt: string;
}

// Complete website project state
export interface WebsiteProject {
  currentStep: number;
  deckAnalysis?: DeckAnalysis;
  websitePurpose?: WebsitePurpose;
  brandVoice?: BrandVoice;
  contentGaps?: ContentGaps;
  homepageContent?: HomepageContent;
  designDirection?: DesignDirection;
  siteStructure?: SiteStructure;
  specDocument?: SpecDocument;
  aiBuilderPrompt?: AIBuilderPrompt;
}

export const STEPS = [
  { number: 1, title: 'Analyze Deck', description: 'Upload & analyze your pitch deck' },
  { number: 2, title: 'Website Purpose', description: 'Define audience and goals' },
  { number: 3, title: 'Brand Voice', description: 'Define personality and tone' },
  { number: 4, title: 'Fill Gaps', description: 'Answer questions to fill missing content' },
  { number: 5, title: 'Homepage Content', description: 'Generate all website copy' },
  { number: 6, title: 'Design Direction', description: 'Define visual style' },
  { number: 7, title: 'Site Structure', description: 'Plan pages and navigation' },
  { number: 8, title: 'Spec Document', description: 'Generate specification' },
  { number: 9, title: 'AI Prompt', description: 'Generate builder prompt' },
  { number: 10, title: 'Next Steps', description: 'Export and build' },
];
