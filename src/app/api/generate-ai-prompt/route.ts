import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/model';

// Long-form blueprint prompt generation. Bump from 10s default.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const { deckAnalysis, brandVoice, designDirection, siteStructure, homepageContent, websitePurpose } = projectData;

    const companyName = deckAnalysis?.elements?.companyName?.content || 'Company';

    // Trust signals come from Step 5's homepageContent (specific items like "DOE ARPA-E grant, $1.5M")
    // — not from Step 6's designDirection (which holds generic CATEGORIES like "University affiliations").
    // Strip out vague items (TBD-style placeholders, single-word categories) so we don't ship a
    // half-finished trust section to Lovable.
    const isSpecificTrustItem = (s: string): boolean => {
      const trimmed = s.trim();
      if (trimmed.length < 12) return false;
      const lower = trimmed.toLowerCase();
      // Reject generic placeholders.
      const genericMarkers = [
        'to be announced', 'tbd', 'coming soon', 'to be confirmed',
        'placeholder', 'will be added', 'pending',
      ];
      if (genericMarkers.some(m => lower.includes(m))) return false;
      // Reject pure category labels with no specifics: "University affiliations",
      // "Team credentials", "Grants and awards", etc. Heuristic: must contain a digit,
      // a $, a year, or at least 2 capital-letter words (named entities).
      const hasNumber = /\d/.test(trimmed);
      const hasDollar = trimmed.includes('$');
      const namedEntityCount = (trimmed.match(/\b[A-Z][a-zA-Z]+\b/g) || []).length;
      return hasNumber || hasDollar || namedEntityCount >= 2;
    };
    const specificTrustItems = (homepageContent?.trustElements || []).filter(isSpecificTrustItem);

    // Logo inlining (Option 1) — if the founder's logo is small enough to embed as a
    // base64 data URL directly in the prompt, do that. Lovable/Bolt/etc. render data URLs
    // natively, so no separate upload step is required. Threshold ~55K chars on the data
    // URL string ≈ 40KB raw image. Above that we fall back to the visible-broken-placeholder
    // path so users still notice the missing logo and upload it manually.
    const logoDataUrl: string | undefined = designDirection?.logo?.dataUrl;
    const INLINE_LOGO_MAX_LEN = 55_000;
    const inlineLogo =
      typeof logoDataUrl === 'string' &&
      logoDataUrl.startsWith('data:image/') &&
      logoDataUrl.length <= INLINE_LOGO_MAX_LEN;

    const brandAssetsBlock = inlineLogo
      ? `=== BRAND ASSETS ===
LOGO HANDLING — the founder's actual logo is embedded inline below as a base64 data URL. Use the data URL EXACTLY as written, no modifications. This renders natively in the browser — no file upload step is needed.
- Header logo (use this EXACT src attribute, including the full data URL): <img src="${logoDataUrl}" alt="${companyName}" class="h-8 w-auto" />
- Footer: use the same data URL src at smaller dimensions (e.g., class="h-6 w-auto"). If the footer background is dark and the logo doesn't render well, apply CSS filter: invert(1) brightness(2).
- DO NOT generate, invent, or design any alternative "logo" from the company name — no stylized letterforms, no SVG word-marks, no text-based logos. The data URL above IS the brand mark.
- Save the company name "${companyName}" exactly as written in the page <title>, in the alt attribute, and anywhere the brand name appears in copy. Do not abbreviate, restyle, or pluralize it.`
      : `=== BRAND ASSETS ===
LOGO HANDLING — read this carefully:
${logoDataUrl
  ? `The founder uploaded a logo file, but it was too large to embed inline in this prompt. They will manually upload it to your project after this prompt is processed.`
  : `The founder will provide their actual logo file separately.`}
- Use this exact placeholder in the header: <img src="/logo.png" alt="${companyName}" class="h-8 w-auto" />
- Also include the same placeholder logo (smaller, white/inverted if needed for contrast) in the footer.
- DO NOT generate, invent, render, or design a "logo" from the company name — no stylized letterforms, no SVG word-marks, no text-styled "logos". The string "${companyName}" is the COMPANY NAME, not a visual brand mark.
- LOUD FALLBACK when /logo.png is missing at render time: render a VISIBLY BROKEN placeholder so the founder cannot miss it. Use a dashed 2px border, height 40px, width 160px, with the text "ADD LOGO.PNG" centered inside in 12px monospace, accent color. Apply the same broken-placeholder pattern in the footer. This is intentionally unattractive — it forces the founder to upload the real logo before shipping. DO NOT silently substitute a text wordmark.
- Save the company name "${companyName}" exactly as written in the page <title>, in the alt attribute, and anywhere the brand name appears in copy. Do not abbreviate, restyle, or pluralize it.`;

    const buildPrompt = () => {
      return `Build a single-page website for ${companyName}, a pre-seed Tough Tech startup.

The OUTPUT must be a complete, working, production-ready single-page website. The audience is a Series A investor (primary) and an engineering recruit (secondary).
${websitePurpose?.firstTenSecondsBelief
  ? `\n=== LOAD-BEARING INVESTOR BELIEF ===\nWithin 10 seconds of landing, the investor must believe:\n"${websitePurpose.firstTenSecondsBelief}"\nThe hero and trust sections must land this specific claim.\n`
  : ''}
This blueprint contains VERBATIM copy. Do not rewrite or paraphrase any quoted text. Use it as-is.

=== TECH STACK (NON-NEGOTIABLE) ===
- Framework: React + Tailwind CSS (use Next.js if available)
- Component baseline: shadcn/ui (Card, Badge, Button) where applicable for built-in shadow/border treatments. Fall back to plain divs only when shadcn doesn't fit.
- Mobile-responsive, mobile-first
- Subtle motion is REQUIRED so the page doesn't read as a static wireframe: stat numerals count up on scroll-into-view (~1s duration), section labels (01/02/03) fade-in on scroll, cards hover-lift on mouseover (transform + shadow). NO motion that delays above-fold content loading.
- Semantic HTML (real <h1>, <section>, <nav>)
- SEO meta tags including description: "${brandVoice?.oneLiner || ''}"

=== DESIGN SYSTEM (USE THESE EXACT VALUES) ===
- Background: ${designDirection?.colorPalette?.background || '#FFFFFF'}
- Primary text: ${designDirection?.colorPalette?.text || '#0A0E1A'}
- Brand color: ${designDirection?.colorPalette?.primary || '#0A2540'}
- Accent (CTAs and highlights ONLY): ${designDirection?.colorPalette?.accent || '#00D4A0'}
- Headline font: ${designDirection?.typography?.headingFont || 'Inter'}, weight 600–700
- Body font: ${designDirection?.typography?.bodyFont || 'Inter'}, weight 400
- For numbers and data: IBM Plex Mono (signals precision)
- Max content width: 1200px, centered
- Generous whitespace in narrative sections; dense data presentation in stat strips — that contrast IS the rhythm
- Sans-serif everywhere; gravitas comes from weight and size, not from serifs or ornament
- SECTION BACKGROUND RHYTHM (required): alternate consecutive section backgrounds between three values — the base background, pure white, and an accent-tinted band (5% accent opacity). NO two adjacent sections may share a background. This rhythm guides the eye down the page and prevents the "all-on-one-cream" wireframe feel.

${brandAssetsBlock}

=== IMAGE ASSET SLOTS ===
The site expects the following image files in the project's asset/files panel (Lovable: Files; Bolt/Cursor/Replit: /public/; Figma Make: image panel + canvas placement). Use these EXACT filenames so the founder can drop images in directly:
- /hero.jpg — main hero visual (lab photo, technology render, abstract scientific imagery)
- /technology.jpg — supporting visual for the Breakthrough or How It Works section (optional)
- /team-1.jpg, /team-2.jpg, /team-3.jpg, ... — one per team member referenced in the TEAM section, headshot-style square or 4:5

UNIVERSAL MISSING-ASSET RULE — applies to every slot above (and to /logo.png from BRAND ASSETS):
When any of these files is not present at render time, render a VISIBLY BROKEN placeholder in its slot — do NOT silently substitute stock, AI-generated abstract art, or generic icon. The placeholder format:
- Dashed 2px border in the accent color, rounded corners (rounded-md)
- A clear filename label centered inside: "ADD /HERO.JPG", "ADD /TEAM-1.JPG", etc., in 12px IBM Plex Mono
- Background: 5% accent-tinted neutral; foreground: accent color
- Maintains the slot's intended dimensions (don't shrink to fit the text)
This is INTENTIONALLY unattractive. The goal is to force the founder to upload real assets before shipping, not let them ship with stock filler.

IF THE FOUNDER WANTS STOCK / AI-GENERATED IMAGERY INSTEAD: they can tell you so in a follow-up prompt ("use a Tough Tech-style hero from Unsplash"). Until they do, default to the broken-placeholder pattern.

=== NAVIGATION ===
Sticky header on scroll. Layout: logo left, nav center-right (${siteStructure?.navigationItems?.join(' / ') || 'About / Technology / Team / Contact'}), primary CTA right.
Primary CTA button text (verbatim): "${homepageContent?.hero?.primaryCTA || websitePurpose?.primaryCTA || 'Contact Us'}"

=== SECTION 1 — HERO ===
Headline (verbatim, do not alter): "${homepageContent?.hero?.headline || companyName}"
Subhead (verbatim): "${homepageContent?.hero?.subheadline || brandVoice?.oneLiner || ''}" — render at text-2xl REQUIRED (never text-base, text-sm, or text-lg — those read as body copy and weaken the hero) with max-w-2xl and leading-relaxed. On mobile, may step down to text-xl. Never smaller.
CTA button (verbatim): "${homepageContent?.hero?.primaryCTA || websitePurpose?.primaryCTA || 'Contact Us'}" — accent color background, no border, generous padding (px-8 py-4 minimum)
Hero visual: render <img src="/hero.jpg" alt="${companyName} hero" class="w-full h-full object-cover rounded-lg" /> as the hero image slot. If /hero.jpg is missing at render time, render the broken-placeholder pattern from IMAGE ASSET SLOTS (dashed accent-color border, "ADD /HERO.JPG" label, 5% accent-tinted background) at the same dimensions. DO NOT generate an SVG illustration as a substitute — the founder should see clearly that the asset is missing. NO stock photography. NO isometric people-at-desks. NO AI-generated abstract blobs. (If the founder later asks for a generated hero illustration in a follow-up message, you may produce a layered SVG illustration in the style of the company's technology — but only on explicit request, never as a silent default.)
Background: solid color or a subtle radial gradient (5–10% accent at center). NO generic linear gradient.
Above-the-fold rule: hero must read complete without scrolling on a 1280×720 viewport.

=== SECTION 2 — PROBLEM ===
Section label: "01 / THE PROBLEM" (small caps, accent color, letter-spaced 0.1em)
Headline (verbatim): "${homepageContent?.problem?.header || ''}"
Body (verbatim): "${homepageContent?.problem?.body || ''}"
If the body contains a number or stat, render it as a callout to the right or below: large IBM Plex Mono numerals (text-5xl or larger).

=== SECTION 3 — THE BREAKTHROUGH ===
Section label: "02 / THE BREAKTHROUGH"
Headline (verbatim): "${homepageContent?.solution?.header || ''}"
Body (verbatim): "${homepageContent?.solution?.body || ''}"
REQUIRED visual: a 3-node horizontal process diagram below the body. Format: [Input] → [Mechanism] → [Output]. Each node is a Card component with shadow-md, a unique tinted background per node (warm cream → accent-tinted → cool gray, in that order), a numbered badge (01/02/03 in IBM Plex Mono, accent color, top-left of card), and a thin SVG arrow connector between nodes with a draw-on-scroll animation. Plain rectangles with hard-edge arrows are FORBIDDEN — they're the single biggest "wireframe" giveaway. If no specific labels are provided, use generic placeholders like "Substrate / Reaction / Product" and add a comment marker for the user to relabel.

=== SECTION 4 — OUTCOMES ===
Section label: "03 / OUTCOMES"
Three-column grid of elevated Card components (shadow-sm; hover:shadow-md; hover:-translate-y-1 with smooth transition). Each card contains, from top: a numbered badge (01/02/03 in IBM Plex Mono, accent color), a small icon (use lucide-react), the headline, and the body. Plain text under thin dividers is FORBIDDEN.
${homepageContent?.benefits?.map((b: { headline: string; description: string }, i: number) =>
  `  Column ${i + 1}: Headline (verbatim) "${b.headline}" / Body (verbatim) "${b.description}"`
).join('\n') || '  (No benefits provided — leave 3 placeholder columns)'}

=== SECTION 5 — HOW IT WORKS ===
Section label: "04 / HOW IT WORKS"
Render as a horizontal step row of elevated Cards OR a vertical timeline (developer's choice based on step count and viewport). Each step has a numbered badge (01/02/03/04 in IBM Plex Mono, accent color), an icon (lucide-react), a verb-led title, and a one-sentence body. Plain text rows under thin dividers are FORBIDDEN.
${homepageContent?.howItWorks?.map((s: { step: number; title: string; description: string }) =>
  `  Step ${s.step}: "${s.title}" — "${s.description}"`
).join('\n') || '  (No steps provided)'}

=== SECTION 6 — TEAM ===
Section label: "05 / TEAM"
Grid of elevated Card components (shadow-sm). Each card contains:
  - A square or 4:5 headshot at the top: <img src="/team-N.jpg" alt="[Member name]" class="w-full aspect-square object-cover rounded-md" /> where N is the 1-indexed position of the team member. Member 1 = /team-1.jpg, member 2 = /team-2.jpg, etc. If a team-N.jpg is missing at render time, render the broken-placeholder pattern from IMAGE ASSET SLOTS (dashed accent border, "ADD /TEAM-N.JPG" label) at the same dimensions. DO NOT substitute initials-in-circle, abstract avatar, or AI-generated faces.
  - Name (font-semibold)
  - Title (text-sm, muted)
  - ONE sentence on credentials specific to THIS problem: degree + university + prior employer + patent or paper count.
  - Optional: a small row of prior-employer logos in muted grayscale (only if real and named in source data — do NOT invent).
Plain text-only cards with hard-edge borders and no headshot slots are FORBIDDEN. Generic resume bullets ("results-driven engineer with 10 years of experience") are forbidden.
Team data from deck: ${deckAnalysis?.elements?.teamInfo?.content || '(no team data provided — leave 3 placeholder cards labeled "TEAM MEMBER — REPLACE WITH REAL BIO")'}

${specificTrustItems.length > 0
  ? `=== SECTION 7 — TRUST ===
Section label: "06 / TRUST"
Render the following as a row of pull-quotes or a tagged list (NOT a generic logo wall):
${specificTrustItems.map((s: string) => `  - ${s}`).join('\n')}
DO NOT invent investor logos, customer logos, or testimonials. Empty placeholder is preferable to fake content.`
  : `=== NO TRUST SECTION ===
The founder has NOT provided specific trust signals (real grants, papers, partners, or named investors). DO NOT render a TRUST section in the output. Specifically:
- Do NOT include a "06 / TRUST" section label.
- Do NOT include a placeholder section saying "What we'll show here as it lands", "Trust signals coming soon", "To be announced", or any similar copy.
- Do NOT add a TBD card, an empty grid, or a faint heading suggesting future content.
- The page MUST flow directly from Section 6 (Team) to Section 8 (Final CTA) with no intervening section, no spacing artifact, and no commented-out block.
If you find yourself writing copy for a Trust section, STOP and delete that section. The site reads stronger without it.`}

=== SECTION 8 — FINAL CTA ===
Headline (verbatim): "${homepageContent?.finalCTA?.headline || ''}"
Supporting text (verbatim): "${homepageContent?.finalCTA?.supportingText || ''}"
Button (verbatim): "${homepageContent?.finalCTA?.buttonText || 'Contact Us'}"
Section background: high contrast — either accent color or near-black. Add a SUBTLE radial gradient (10–15% lighter at center) OR a faint noise/grain texture overlay so the section doesn't read as flat solid color. Light text on dark, or vice versa. The CTA button should contrast strongly against this background (e.g., white button on accent-color background).

=== FOOTER ===
Minimal: location placeholder, copyright, ${siteStructure?.footerItems?.join(' / ') || 'Privacy / Contact / LinkedIn'}.
${websitePurpose?.linkedInUrl ? `LinkedIn: ${websitePurpose.linkedInUrl}` : ''}
${websitePurpose?.twitterUrl ? `X: ${websitePurpose.twitterUrl}` : ''}
Max 5 links. No newsletter widget unless the founder has a real list.

=== ANTI-PATTERNS — DO NOT DO ANY OF THESE ===
- DO NOT use stock photography of people in lab coats or "scientist with iPad" shots
- DO NOT use isometric illustrations of people working at desks
- DO NOT use pastel color palettes or rounded-card-everywhere "consumer SaaS" aesthetic
- DO NOT use confetti gradients, neon, or playful color combos
- DO NOT use "Learn More" as any CTA
- DO NOT use carousels of testimonials or auto-playing video
- DO NOT add chatbot widgets, popups, or cookie banners beyond a minimal accept button
- DO NOT invent investor logos, customer logos, awards, or partnerships
- DO NOT use Lorem Ipsum — every text block above contains the verbatim copy to use
- DO NOT use serif display fonts — sans-serif throughout
- DO NOT add a generic "About" page, blog, or pricing
- DO NOT include the words: revolutionary, innovative, cutting-edge, next-generation, transformative, disruptive, world-class, seamless, robust, AI-powered (as buzzword), game-changing, paradigm shift, synergy

=== ASSETS WHERE NOT PROVIDED ===
${designDirection?.avoidList?.map((item: string) => `- AVOID: ${item}`).join('\n') || ''}

=== SUCCESS CRITERION ===
A Series A investor lands on the page, scrolls through it once, and can answer:
1. What specifically does this team do? (named in the hero)
2. What proof do they have it works? (visible in trust + outcomes sections)
3. Why now? (visible in the breakthrough section)
If the rendered site does not answer all three within the first two screens, regenerate.

Generate the complete React + Tailwind code for this website.`;
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ prompt: buildPrompt() });
    }

    // With API key, we can polish the prompt
    const client = new Anthropic({ apiKey });

    const prompt = `You are an editor reviewing a Lovable/Bolt blueprint for a pre-seed Tough Tech website. Apply this strict editorial pass to the blueprint below. The user will paste your output directly into Lovable/Bolt — it must be ready to use.

EDITORIAL RULES:
1. BANNED WORDS — find and replace every instance of: revolutionary, revolutionizing, innovative, cutting-edge, next-generation, next-gen, transformative, disruptive, world-class, best-in-class, seamless, robust, powerful, AI-powered (as buzzword), synergy, synergies, paradigm shift, game-changing, leveraging, empowering (unless followed by a concrete object). Replace each with a specific concrete claim, or delete the sentence.

2. VAGUE CLAIMS — find any unqualified adjective ("fast," "scalable," "advanced," "efficient," "reliable"). Either add a specific number/comparison ("3× faster than electrochemical alternatives") or delete it.

3. "WE" OPENERS — find any sentence in the Hero, Problem, Solution, Outcomes, or How It Works sections that starts with "We". Rewrite to start with the noun, the outcome, or the incumbent. Team bios and mission lines may keep "We."

4. WEAK CTAs — find any "Learn More" / "Get Started" / "Sign Up Free" button text. Replace with: "See how it works" / "Read the technical paper" / "Meet the team" / "Contact Us" / "Get early access".

5. PLACEHOLDERS — confirm every section has VERBATIM copy filled in. If you find any "[insert headline]", "[describe X]", or empty string, flag it explicitly with a marker like <!-- MISSING: hero subhead --> rather than silently generating new text.

6. HERO LENGTH — confirm the hero headline is ≤10 words. If longer, rewrite using one of these formulas: outcome+qualifier ("Crop Protection Without Compromise"), category claim ("The 21st century metals company"), input/output staccato ("Rocks in. Lithium out. Zero waste."), contrarian declaration ("Novel superconductors the world actually needs"), capability sentence.

7. TRUST INTEGRITY — the Trust section must NOT invent any investor logo, customer logo, award, or testimonial. If the source data has no trust signals, leave the placeholder block exactly as written ("REPLACE WITH REAL LOGOS WHEN AVAILABLE").

8. PRESERVE STRUCTURE — keep all section labels (01, 02, 03 …), all design system values (hex codes, fonts), all anti-pattern lists, and the success criterion exactly as written. Do not add or remove sections.

OUTPUT: Return ONLY the improved blueprint text, ready to paste into Lovable/Bolt. No preamble, no commentary, no markdown code fence.

BLUEPRINT TO REVIEW AND EDIT:

${buildPrompt()}`;

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : buildPrompt();

    return NextResponse.json({ prompt: responseText });
  } catch (error) {
    console.error('Generate AI prompt error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
