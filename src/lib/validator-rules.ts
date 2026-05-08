// Validator rules for the Quality Check step.
//
// This is the single source of truth: the UI displays these rules to the founder,
// and the /api/validate prompt feeds them to Claude as the checklist.
// To add or change a rule, edit ONLY this file.
//
// Patterns derived from docs/tough-tech-patterns.md (analysis of 17 reference sites).

export type RuleCategory = 'hero' | 'banned-words' | 'specificity' | 'voice' | 'ctas' | 'design' | 'brevity';

export interface ValidatorRule {
  id: string;
  category: RuleCategory;
  /** Short label shown in the UI checklist. */
  label: string;
  /** Detailed instruction Claude uses to evaluate this rule. */
  detail: string;
}

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  hero: 'Hero',
  'banned-words': 'Banned words',
  specificity: 'Specificity',
  voice: 'Voice',
  ctas: 'CTAs',
  design: 'Design',
  brevity: 'Brevity',
};

export const VALIDATOR_RULES: ValidatorRule[] = [
  // Hero
  {
    id: 'hero-length',
    category: 'hero',
    label: 'Hero headline is ≤10 words',
    detail: 'Count words in homepageContent.hero.headline. PASS if ≤10. The sweet spot is 5–6 words. If FAIL, suggest a tighter headline using one of: outcome+qualifier, category claim, input/output staccato, contrarian declaration, capability sentence.',
  },
  {
    id: 'hero-not-generic',
    category: 'hero',
    label: 'Hero is not interchangeable with another company',
    detail: 'Read the hero headline + subhead. Could the same two sentences appear on a different company\'s site without anyone noticing? PASS if distinctly tied to this company. FAIL if generic ("Transforming the future", "Power. Protection. Progress." with no specific tie-in).',
  },
  {
    id: 'hero-subhead-length',
    category: 'hero',
    label: 'Hero subhead is ≤25 words, one sentence',
    detail: 'Count words and sentences in homepageContent.hero.subheadline. PASS if ≤25 words AND a single sentence. If FAIL, suggest a tighter rewrite using the formula: [Company] [strong verb] [the noun] [for/required by] [named markets].',
  },

  // Banned words
  {
    id: 'no-banned-words',
    category: 'banned-words',
    label: 'No banned buzzwords appear anywhere in copy',
    detail: 'Scan ALL copy fields (hero, problem, solution, benefits, howItWorks, finalCTA) for these banned words: revolutionary, revolutionizing, innovative, cutting-edge, next-generation, next-gen, transformative, disruptive, world-class, best-in-class, seamless, robust, AI-powered (as buzzword, OK as integration label), synergy, synergies, paradigm shift, game-changing, leveraging, empowering (without a concrete object). Quote each violation. Suggest a specific replacement.',
  },

  // Specificity
  {
    id: 'problem-has-stat',
    category: 'specificity',
    label: 'Problem section includes a specific number',
    detail: 'homepageContent.problem.body must contain at least one specific number, percentage, dollar amount, or named source. "Many companies struggle" FAILS. "$22B drained yearly" PASSES. If FAIL, suggest a number to add.',
  },
  {
    id: 'solution-has-claim',
    category: 'specificity',
    label: 'Solution section has a specific technical claim',
    detail: 'homepageContent.solution.body must contain at least one specific technical claim — a number, named comparison, or verifiable mechanism. Vague descriptions like "advanced new approach" FAIL. If FAIL, suggest a specific claim derived from other inputs.',
  },
  {
    id: 'trust-specific',
    category: 'specificity',
    label: 'Trust signals are specific (named grants, papers, partners)',
    detail: 'homepageContent.trustElements should reference actual grants, papers, universities, or partners by name. Generic items like "Team credentials" or "University affiliations" FAIL — they should name the actual university or credential. If FAIL, suggest more specific phrasing using only inputs the founder has provided (do NOT invent).',
  },
  {
    id: 'team-domain-credentials',
    category: 'specificity',
    label: 'Team credentials are domain-specific (not generic resume bullets)',
    detail: 'Read deckAnalysis.elements.teamInfo.content (provided in TEAM INFO block above). Each named team member should have a credential SPECIFIC to this problem — degree + university + prior employer + patent or paper count if relevant. Generic resume bullets like "results-driven engineer with 10 years experience" or "passionate about the mission" FAIL. PASS if at least the founder/CTO has a domain-specific credential. If TEAM INFO is missing or empty, return status="na". Do NOT auto-fix this — set needsInput=true and describe what credentials to add.',
  },

  // Voice
  {
    id: 'no-we-openers',
    category: 'voice',
    label: 'No load-bearing sentence starts with "We"',
    detail: 'Check Hero, Problem, Solution, Benefits, and How It Works sections. None of those sentences should start with "We". (FinalCTA may use "we" if mission-style.) Quote each violation. Suggest a rewrite that starts with the noun, the outcome, or the incumbent.',
  },
  {
    id: 'company-name-capitalized',
    category: 'voice',
    label: 'Company name is capitalized correctly throughout copy',
    detail: 'The canonical company name is in deckAnalysis.elements.companyName.content (e.g., "Aptamino"). Scan ALL homepageContent copy fields for any occurrence that matches the company name case-insensitively but does NOT match its canonical capitalization (e.g., "aptamino" or "APTAMINO" mid-sentence when the canonical is "Aptamino"). PASS if every occurrence uses the canonical form. FAIL if any field has a miscased occurrence. When you FAIL: pick the FIRST field that contains a miscased occurrence and report only that one (the founder will re-run validation after applying — subsequent miscased occurrences will surface one at a time). Set fixPath to that field\'s exact dot-path — examples: "homepageContent.hero.headline", "homepageContent.hero.subheadline", "homepageContent.problem.body", "homepageContent.solution.body", "homepageContent.finalCTA.headline", "homepageContent.finalCTA.body", "homepageContent.benefits[2].description", "homepageContent.howItWorks[1].description". Set quote to the verbatim current value of that field. Set fix to the same field\'s text with every miscased occurrence of the company name replaced by the canonical form — preserve every other character (whitespace, punctuation, em dashes, etc.) exactly. needsInput must be false (this is auto-fixable). If deckAnalysis.elements.companyName.content is missing or empty, return status="na".',
  },

  // CTAs
  {
    id: 'ctas-safe-set',
    category: 'ctas',
    label: 'All CTAs are from the pre-seed safe set',
    detail: 'Safe set: "Contact Us", "Get in touch", "Reach Out", "Make Contact", "Get early access", "Register Interest", "Partner with us", "How it works", "See the technology", "Meet the team". Banned: "Learn More", "Buy Now", "Get Started", "Sign Up Free", "Try Now". Check homepageContent.hero.primaryCTA and homepageContent.finalCTA.buttonText. Suggest a safe-set replacement for any violation.',
  },

  // Design
  {
    id: 'colors-hex',
    category: 'design',
    label: 'Color palette uses real hex codes',
    detail: 'designDirection.colorPalette.primary, accent, background, text must each be a valid 6-digit hex code (e.g., "#0A2540"). "Dark blue" or "navy" FAILS. If FAIL, suggest a specific hex.',
  },
  {
    id: 'fonts-named',
    category: 'design',
    label: 'Typography specifies actual font names',
    detail: 'designDirection.typography.headingFont and bodyFont must be specific font names (e.g., "Inter", "DM Serif Display", "IBM Plex Sans"). Generic descriptions like "modern sans-serif" or "clean serif" FAIL. If FAIL, suggest a specific Google Font name.',
  },

  // Brevity
  {
    id: 'benefits-brief',
    category: 'brevity',
    label: 'Each benefit description is ≤15 words',
    detail: 'For each homepageContent.benefits[i].description, count words. PASS if every benefit ≤15 words. If FAIL, quote the offending benefit and suggest a tighter rewrite.',
  },
  {
    id: 'steps-brief',
    category: 'brevity',
    label: 'Each How It Works step description is ≤12 words',
    detail: 'For each homepageContent.howItWorks[i].description, count words. PASS if every step ≤12 words. If FAIL, quote the offender and suggest a tighter rewrite.',
  },
];

// ===== Result types =====

export type RuleStatus = 'pass' | 'fail' | 'na';

export interface RuleResult {
  ruleId: string;
  status: RuleStatus;
  /** The offending text/value if status === 'fail'. */
  quote?: string;
  /**
   * Suggested replacement (auto-fixable) OR guidance to the founder (human-fixable).
   * If `needsInput` is true, this is advice — not a literal value to substitute.
   */
  fix?: string;
  /**
   * Dot-path into the project where the fix should be applied.
   * Examples: "homepageContent.hero.headline", "homepageContent.benefits[1].description",
   *           "designDirection.colorPalette.primary".
   */
  fixPath?: string;
  /**
   * True when `fix` is guidance to the founder, not a ready-to-use replacement value.
   * The UI pre-fills the manual-edit input as blank in this case (current value is shown as `quote`).
   */
  needsInput?: boolean;
}

export interface ValidationResult {
  results: RuleResult[];
  passedCount: number;
  totalCount: number;
}
