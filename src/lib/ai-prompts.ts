// Step 1: Deck Analysis Prompt
export const DECK_ANALYSIS_PROMPT = `I'm a startup founder and I want to turn my pitch deck into a professional website. I've attached my deck. Please review it and extract the following elements, noting whether each is present, partially present, or missing:

1. Company/product name and tagline
2. Problem statement
3. Solution description
4. Target audience/customers
5. Key features or benefits
6. How it works (process or flow)
7. Differentiators or competitive advantages
8. Team information
9. Current status (beta, launched, funding stage)
10. Contact information or call-to-action

For each element that's present, quote the relevant text. For anything missing, just note it — we'll fill those gaps next.

Return your analysis as JSON in this exact format:
{
  "elements": {
    "companyName": { "status": "present|partial|missing", "content": "extracted text or null" },
    "tagline": { "status": "present|partial|missing", "content": "extracted text or null" },
    "problemStatement": { "status": "present|partial|missing", "content": "extracted text or null" },
    "solutionDescription": { "status": "present|partial|missing", "content": "extracted text or null" },
    "targetAudience": { "status": "present|partial|missing", "content": "extracted text or null" },
    "keyFeatures": { "status": "present|partial|missing", "content": "extracted text or null" },
    "howItWorks": { "status": "present|partial|missing", "content": "extracted text or null" },
    "differentiators": { "status": "present|partial|missing", "content": "extracted text or null" },
    "teamInfo": { "status": "present|partial|missing", "content": "extracted text or null" },
    "currentStatus": { "status": "present|partial|missing", "content": "extracted text or null" },
    "contactInfo": { "status": "present|partial|missing", "content": "extracted text or null" }
  }
}

Pitch deck content:
`;

// Step 4: Gap Filling Questions
export const GAP_QUESTIONS_PROMPT = `Based on the gaps you identified in my pitch deck, please ask me the questions I need to answer to fill them. Focus on the most important gaps first:
- Anything related to my primary audience and their problems
- My unique value proposition and differentiators
- How my product/service actually works
- Trust and credibility elements
- Clear calls-to-action

Common questions you might ask:
- "What is the status quo or state-of-the-art that is not sufficient?"
- "What's the single most impressive benefit your product delivers?"
- "What credentials or experience make you the right team for this?"
- "Do you have any technical/scientific traction, papers, awards, or evidence that your solution is promising?"

The deck analysis shows these elements as missing or partial:
{gaps}

Generate 3-5 specific questions to ask the founder. Return as JSON:
{
  "questions": [
    { "id": "q1", "question": "Question text", "context": "Why this matters" }
  ]
}
`;

// Step 5: Homepage Content Generation
export const HOMEPAGE_CONTENT_PROMPT = `Now please generate the homepage content based on everything we've discussed. The target audience is primarily investors, talent, and early partners (Tough Tech, pre-seed perspective). Make the tone match the brand personality defined. Write for the primary audience.

Company Information:
{companyInfo}

Brand Voice:
{brandVoice}

Include:
1. HERO SECTION - A headline (under 10 words, attention-grabbing), 3 alternative headline options, a subheadline (1-2 sentences explaining what we do), a primary call-to-action button text
2. PROBLEM SECTION - A header with 2-3 sentences capturing the pain point our audience feels
3. SOLUTION SECTION - A header with 2-3 sentences on how we solve the problem
4. BENEFITS (3 items) - Each item with a short headline and 1-sentence description - Focus on outcomes, not features
5. HOW IT WORKS (3-4 steps) - Simple, clear steps showing the user journey
6. TRUST ELEMENTS - Suggest what social proof or credibility elements to include
7. FINAL CTA - Closing headline with button text and any supporting text

Generate content in this exact JSON format:
{
  "hero": {
    "headline": "Under 10 words, attention-grabbing",
    "alternativeHeadlines": ["Option 2", "Option 3", "Option 4"],
    "subheadline": "1-2 sentences explaining what we do",
    "primaryCTA": "Button text"
  },
  "problem": {
    "header": "Section header",
    "body": "2-3 sentences capturing the pain point"
  },
  "solution": {
    "header": "Section header",
    "body": "2-3 sentences on how we solve the problem"
  },
  "benefits": [
    { "headline": "Short headline", "description": "1-sentence description focusing on outcomes" },
    { "headline": "Short headline", "description": "1-sentence description focusing on outcomes" },
    { "headline": "Short headline", "description": "1-sentence description focusing on outcomes" }
  ],
  "howItWorks": [
    { "step": 1, "title": "Step title", "description": "Brief description" },
    { "step": 2, "title": "Step title", "description": "Brief description" },
    { "step": 3, "title": "Step title", "description": "Brief description" }
  ],
  "trustElements": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "finalCTA": {
    "headline": "Closing headline",
    "buttonText": "Button text",
    "supportingText": "Any supporting text"
  }
}
`;

// Step 6: Design Direction
export const DESIGN_DIRECTION_PROMPT = `Help me define the visual design direction for the website. Use the "Tough Tech Website Standard" — a proven approach used by successful deep tech and science-driven startups — in conjunction with the color palette, typography and logo from my pitch deck.

Company Information:
{companyInfo}

Brand Voice:
{brandVoice}

VISUAL STYLE - Based on my brand, determine:
- Color palette: Primary color, accent color (e.g., for CTAs), background colors. Include hex codes.
- Typography
- Imagery style: Abstract/scientific visuals preferred over stock photography. Process diagrams, data visualizations, or subtle tech imagery.
- What to AVOID: Generic stock photos, cluttered layouts, playful/casual aesthetics (unless brand dictates otherwise).

TOUGH TECH STANDARD - Example sites that embody the approach:
- https://coperniccatalysts.com/
- https://reynko.com/
- https://quantumformatics.com/
- https://rockzero.com/
- https://www.robigo.bio/
- https://foraybio.com/
- https://dropletbiosci.com/
- https://anthology.bio/

TRUST SIGNALS TO INCLUDE - Recommend which of these to feature:
- Investor/funder logos
- University or research institution affiliations
- Team credentials (PhDs, prior companies)
- Grants, awards, or press mentions
- Technical publications or patents
- Pilot customers or partnerships

Generate design direction as JSON:
{
  "colorPalette": {
    "primary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "headingFont": "Modern sans-serif font name",
    "bodyFont": "Clean readable font name"
  },
  "imageryStyle": "Description of imagery approach",
  "avoidList": ["Things to avoid in design"],
  "referenceWebsites": ["2-3 real website URLs similar to this company type"],
  "trustSignals": ["Which trust elements to feature"]
}
`;

// Step 7: Site Structure
export const SITE_STRUCTURE_PROMPT = `Based on my company stage and goals, recommend a website structure that falls within The Engine's guidelines.

Company Stage: {stage}
Company Info: {companyInfo}

Answer these questions:
1. Should I start with a single-page site or multiple pages?
2. With both options, I want the section order to be as follows: Home, About, Technology/Science, Careers/Join Us, News/Updates, Contact, (optional: Partner/Collaboration)
3. What navigation items should appear in the header?
4. What should be in the footer?
5. Is there any content I should cut or save for later to keep things focused?

Give a clear recommendation with reasoning. I want the prescribed structure while still making the site look professional and achieve my goals.

Tip: Simpler is almost always better for early-stage startups. You can always add pages later. A focused, clear, one-page site can be sufficient.

Generate structure recommendation as JSON:
{
  "type": "single-page or multi-page",
  "sections": ["List of sections in order"],
  "navigationItems": ["Items for header navigation"],
  "footerItems": ["Items for footer"],
  "contentToCut": ["Any content to save for later to keep focused"],
  "reasoning": "Brief explanation of the recommendation"
}
`;

// Step 8: Spec Document
export const SPEC_DOCUMENT_PROMPT = `Please compile everything we've created into a single Website Specification Document in Markdown format.

Project Data:
{projectData}

Create a document with these sections:
1. PROJECT OVERVIEW - Company name, tagline, one-liner; Primary website goal; Target audience
2. BRAND GUIDELINES - Brand personality; Tone of voice; Color palette with hex codes; Typography direction; Imagery style
3. SITE STRUCTURE - Pages needed; Navigation structure; Footer contents
4. PAGE CONTENT - All headlines, body copy, and CTAs organized by section; Include all the homepage content we created
5. DESIGN NOTES - Reference websites; Layout guidance; Key visual elements
6. TECHNICAL REQUIREMENTS - Any integrations needed (email signup, analytics, etc.); Form fields if applicable
7. ASSETS NEEDED - List of images, logos, or other materials to gather

Format it cleanly so I could hand it directly to a developer.
`;

// Step 9: AI Builder Prompt
export const AI_BUILDER_PROMPT_PROMPT = `Now create a ready-to-use prompt I can paste into an AI website builder like Bolt.new, Lovable, or Webflow AI.

Project Data:
{projectData}

The prompt should:
1. Be a single, self-contained block of text
2. Include ALL the content we created (headlines, body copy, CTAs)
3. Specify the visual design direction (colors, fonts, style)
4. Describe each section of the page in order
5. Include any technical requirements (forms, buttons, etc.)
6. Be tool-agnostic (work with any AI website builder)

Format it clearly with section headers so the AI builder knows exactly what to create. The goal is: I paste this prompt, and I get a working website. Make it comprehensive but not bloated. Include everything needed, nothing extra.

Return just the prompt text, no JSON wrapper.
`;
