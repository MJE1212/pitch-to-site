import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/model';
import { extractJsonObject } from '@/lib/json-extract';

// Brand-guide PDF parsing + design generation can take 20–40s. Bump from 10s default.
export const maxDuration = 60;

// Helper function to extract just the hex code from a string
function extractHexColor(colorString: string, fallback: string): string {
  if (!colorString) return fallback;
  const match = colorString.match(/#[0-9A-Fa-f]{6}\b/);
  return match ? match[0] : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const { deckAnalysis, brandVoice, websitePurpose, brandGuide, contentGaps } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Source of truth for deck-derived brand colors. Two stacking sources, in priority order:
    //   1) deckAnalysis.brandColors — colors Claude vision *saw* on the deck slides
    //      (only populated for image-based decks; this is the reliable signal).
    //   2) Hex codes that happen to appear in deckAnalysis.rawText as literal "#RRGGBB"
    //      strings — rare, only meaningful for text-based decks that include explicit
    //      brand guidelines text. Greedy regex match.
    // We dedupe and prioritize so the design generation gets the strongest signal first.
    const rawText = deckAnalysis?.rawText || '';
    const rawTextHexColors = rawText.match(/#[0-9A-Fa-f]{6}\b/g) || [];
    const visualPalette: string[] = Array.isArray(deckAnalysis?.brandColors?.palette)
      ? deckAnalysis.brandColors.palette.filter((c: unknown): c is string => typeof c === 'string')
      : [];
    const visualPrimary: string | undefined = deckAnalysis?.brandColors?.primary;
    const visualAccent: string | undefined = deckAnalysis?.brandColors?.accent;

    // Combined ordered list, primary first, then accent, then palette extras, then raw-text hex.
    const orderedColors: string[] = [];
    const seen = new Set<string>();
    const pushUnique = (c: string | undefined) => {
      if (typeof c !== 'string') return;
      const key = c.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      orderedColors.push(c);
    };
    pushUnique(visualPrimary);
    pushUnique(visualAccent);
    visualPalette.forEach(pushUnique);
    rawTextHexColors.forEach(pushUnique);

    const hexColors = orderedColors;
    const hasExistingColors = hexColors.length > 0;

    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode - use deck colors if available, otherwise Tough Tech standard
      const design = hasExistingColors
        ? {
            colorPalette: {
              primary: hexColors[0] || '#1e3a5f',
              accent: hexColors[1] || '#3b82f6',
              background: '#ffffff',
              text: '#1f2937',
            },
            typography: {
              headingFont: 'Inter',
              bodyFont: 'Inter',
            },
            imageryStyle: 'Abstract scientific visuals, process diagrams, and subtle tech imagery. Avoid generic stock photos.',
            avoidList: [
              'Generic stock photography',
              'Cluttered layouts',
              'Playful or casual aesthetics',
              'Too many colors',
              'Overly complex animations',
            ],
            referenceWebsites: [
              'https://coperniccatalysts.com',
              'https://reynko.com',
              'https://anthology.bio',
            ],
            trustSignals: [
              'University or research institution affiliations',
              'Team credentials (PhDs, prior experience)',
              'Technical publications or patents',
              'Grants or awards',
            ],
          }
        : {
            colorPalette: {
              primary: '#1e3a5f',
              accent: '#3b82f6',
              background: '#ffffff',
              text: '#1f2937',
            },
            typography: {
              headingFont: 'Inter',
              bodyFont: 'Inter',
            },
            imageryStyle: 'Abstract scientific visuals, process diagrams, and subtle tech imagery. Avoid generic stock photos.',
            avoidList: [
              'Generic stock photography',
              'Cluttered layouts',
              'Playful or casual aesthetics',
              'Too many colors',
              'Overly complex animations',
            ],
            referenceWebsites: [
              'https://coperniccatalysts.com',
              'https://reynko.com',
              'https://anthology.bio',
            ],
            trustSignals: [
              'University or research institution affiliations',
              'Team credentials (PhDs, prior experience)',
              'Technical publications or patents',
              'Grants or awards',
            ],
          };

      return NextResponse.json({ design });
    }

    const client = new Anthropic({ apiKey });

    // Include any existing colors found in the deck
    const colorContext = hasExistingColors
      ? `\n\nIMPORTANT: The pitch deck contains these brand colors: ${hexColors.join(', ')}.
HOW TO USE THEM:
- If exactly ONE brand color was found, treat it as the ACCENT (used for CTAs/links/highlights). Pair it with a neutral dark for PRIMARY (e.g., #1E1F22, #0F172A, or a darker shade of the brand color).
- If TWO OR MORE brand colors were found, the darker/more saturated one is PRIMARY (dark surfaces, headlines), and the brighter one is ACCENT (CTAs/links).
- Never put the same hex in both primary and accent slots.`
      : '\n\nNo brand colors were found in the pitch deck, so suggest appropriate colors following the Tough Tech standard: PRIMARY is a dark/muted dominant color (deep navy, near-black, or dark brand color) used for hero panels and dark surfaces; ACCENT is ONE bright highlight color used for CTAs, links, and callouts. They must be visually distinct.';

    const prompt = `Help me define the visual design direction for the website. Use the "Tough Tech Website Standard" — a proven approach used by successful deep tech and science-driven startups — in conjunction with the color palette, typography and logo from the pitch deck.

Company: ${deckAnalysis?.elements?.companyName?.content || 'Tech Startup'}
Brand Personality: ${brandVoice?.personalityTraits?.join(', ') || 'Professional, Innovative, Trustworthy'}
${colorContext}
${contentGaps?.answers?.aesthetic_reference ? `
=== POSITIVE AESTHETIC REFERENCE (founder-provided) ===
${contentGaps.answers.aesthetic_reference}
Borrow density, voice, and visual rhythm from this reference where appropriate.
` : ''}
${contentGaps?.answers?.do_not_emulate_sites ? `
=== ANTI-REFERENCES — DO NOT pull patterns from these ===
${contentGaps.answers.do_not_emulate_sites}
Actively avoid colors, typography, layout patterns, and copy register that resemble these sites.
` : ''}
${contentGaps?.answers?.do_not_want ? `
=== AESTHETIC FEEL TO AVOID (founder-provided) ===
${contentGaps.answers.do_not_want}
` : ''}
${brandGuide ? `
=== BRAND GUIDE — STRICT OVERRIDES ===
A brand guide PDF (${brandGuide.fileName}) is attached above. EXTRACT its actual colors, fonts, voice rules, imagery guidance, and any "do/don't" specifications. These OVERRIDE the Tough Tech defaults AND any colors found in the deck.

Specifically:
- If the brand guide specifies hex codes, use them EXACTLY in colorPalette (do not modify, do not "improve").
- If the brand guide specifies fonts by name (Helvetica, Inter, Söhne, etc.), use those names.
- If the brand guide specifies imagery rules (e.g., "no people in lab coats", "always use real product photography"), surface them in imageryStyle and avoidList.
- If the brand guide specifies voice/tone rules, weight them when picking trustSignals.
- ONLY fall back to Tough Tech defaults for fields the brand guide does NOT cover.

If the brand guide is unreadable or contains no usable design specifications, note this in imageryStyle and proceed with Tough Tech defaults.
` : ''}

VISUAL STYLE Requirements:
- Color palette: FOUR distinct hex codes filling four DIFFERENT roles:
  - primary: dark/dominant brand color (used for hero panels, dark sections, large surfaces). Typically near-black, deep navy, or a darkened brand color.
  - accent: ONE bright highlight color (used for CTAs, links, key data, charts). Typically a vivid blue, green, or red — never the same as primary.
  - background: page background. Typically white or very light neutral.
  - text: body text color. Typically near-black or a dark grey, distinct from primary if primary is a saturated color.
- HARD RULE: primary !== accent. They are different colors with different jobs.
- Typography: Modern sans-serif
- Imagery style: Abstract/scientific visuals preferred over stock photography. Process diagrams, data visualizations, or subtle tech imagery.
- What to AVOID: Generic stock photos, cluttered layouts, playful/casual aesthetics (unless brand dictates otherwise).

TOUGH TECH REFERENCE LIBRARY (17 curated sites, tagged by approach):
- DATA-FORWARD / DENSITY: sitration.com (Inputs→Outputs flow + 3-stat strip), foundationalloy.com (numbered sections, sparse manifesto voice), pascaltechnology.com (peer-paper as trust anchor)
- CLEAN & RESTRAINED: lithiosinc.com (industrial palette, dark mode), openstar.tech (vision-led, FAQ as final), coperniccatalysts.com (founder-credential heavy)
- INPUT-OUTPUT STACCATO: rockzero.com ("Rocks in. Lithium out. Zero waste."), robigo.bio ("Crop Protection Without Compromise")
- CLINICAL PRECISION: anvildiagnostics.com (3-stat hero anchor), dropletbiosci.com (rhetorical-question subhead), nanopath.com (3-axis trilemma framing)
- CONTRARIAN POSITIONING: quantumformatics.com ("THE WORLD ACTUALLY NEEDS")
- MISSION-LED: anthology.bio (3-node tech flow, 01/02/03 pillars), foraybio.com ("shouldn't have to come at the expense of…")
- INDUSTRIAL APPLIED: reynko.com (real applied photography, single dramatic stat), teragenenergy.com (cited third-party data)
- PRODUCT-LED: dropgenie.com (multiplier-stat strip — borrow architecture, NOT design)
${brandVoice?.aestheticArchetype ? `
=== AESTHETIC ARCHETYPE — CALIBRATE TO THIS ===
The founder selected the "${brandVoice.aestheticArchetype}" archetype. Tune output accordingly:
${
  brandVoice.aestheticArchetype === 'cold-precise'
    ? '- Near-monochrome palette. Minimal accent color. IBM Plex Mono for data. Generous whitespace, no decorative imagery. Reference: Pascal, Cohere editorial restraint.'
    : brandVoice.aestheticArchetype === 'bold-mission'
    ? '- Higher-contrast palette with one bold accent. Larger headline scale. Mission-led hero copy. Reference: Anthology, Anduril confidence.'
    : brandVoice.aestheticArchetype === 'credible-academic'
    ? '- Numbered section labels (01/02/03). Peer-reviewed paper or grant cited near hero. Body copy reads like a Nature abstract that opens with a Wired headline. Reference: Foundation Alloy, Pascal.'
    : '- Short sentences. Single-stat strips. Minimal chrome. Get-to-the-point density. Reference: Rock Zero, early-stage YC site energy.'
}
` : ''}

TRUST SIGNALS TO INCLUDE - Recommend which of these to feature:
- Investor/funder logos
- University or research institution affiliations
- Team credentials (PhDs, prior companies)
- Grants, awards, or press mentions
- Technical publications or patents
- Pilot customers or partnerships

=== STRICT OUTPUT RULES ===
- Return ONLY the JSON object below. No prose before or after. No markdown code fence. No commentary fields ("rationale", "explanation", etc.).
- Use ONLY the field names in the schema below — do NOT add fields like "secondaryBackground", "mutedAccent", or "rationale".
- For colorPalette values, return ONLY the hex code (e.g., "#1e3a5f"), NOT descriptions.
- colorPalette.primary and colorPalette.accent MUST be different hex values. If you only have one brand color from the deck, that one goes in accent — pick a separate dark for primary (see "HOW TO USE THEM" above).
- imageryStyle: ONE sentence, ≤30 words. No paragraphs.
- avoidList, trustSignals: each item ≤12 words. Max 6 items per list.
- referenceWebsites: exactly 3 URLs.

Return this exact JSON shape:
{
  "colorPalette": {
    "primary": "#1e3a5f",
    "accent": "#3b82f6",
    "background": "#ffffff",
    "text": "#1f2937"
  },
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter"
  },
  "imageryStyle": "One sentence, ≤30 words.",
  "avoidList": ["Item ≤12 words", "Item ≤12 words"],
  "referenceWebsites": ["url1", "url2", "url3"],
  "trustSignals": ["Item ≤12 words", "Item ≤12 words"]
}`;

    // If a brand guide PDF is attached, send it as a document block alongside the prompt.
    const messageContent = brandGuide
      ? [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: brandGuide.dataBase64,
            },
          },
          { type: 'text', text: prompt },
        ]
      : prompt;

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: messageContent }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let design: any;
    try {
      design = extractJsonObject(responseText);
    } catch (parseError) {
      console.error('[generate-design] JSON parse failed. Raw response:', responseText);
      throw parseError;
    }

    // Clean up color values - extract just the hex codes
    if (design.colorPalette) {
      design.colorPalette = {
        primary: extractHexColor(design.colorPalette.primary, '#1e3a5f'),
        accent: extractHexColor(design.colorPalette.accent, '#3b82f6'),
        background: extractHexColor(design.colorPalette.background, '#ffffff'),
        text: extractHexColor(design.colorPalette.text, '#1f2937'),
      };

      // Defensive fallback: if the model returned the same hex for primary and accent
      // (the prompt forbids it, but still happens occasionally — see prior Aptamino bug),
      // override primary with a neutral dark so the two slots play different roles.
      if (
        design.colorPalette.primary.toLowerCase() ===
        design.colorPalette.accent.toLowerCase()
      ) {
        console.warn(
          `[generate-design] primary === accent (${design.colorPalette.primary}); overriding primary to #1E1F22.`
        );
        design.colorPalette.primary = '#1E1F22';
      }
    }

    // Always include the AI-generated-visuals rule in the avoid list, regardless of what
    // the model returned. This is a cohort-wide guideline (we want hero/section imagery
    // from Unsplash or real photography, not AI-rendered charts that often look uncanny
    // and read as cheap to investors).
    if (Array.isArray(design.avoidList)) {
      const AI_VISUALS_RULE = 'AI-generated charts and other scientific visuals';
      const alreadyPresent = design.avoidList.some(
        (item: unknown) =>
          typeof item === 'string' && item.toLowerCase().includes('ai-generated')
      );
      if (!alreadyPresent) {
        design.avoidList.push(AI_VISUALS_RULE);
      }
    }

    return NextResponse.json({ design });
  } catch (error) {
    console.error('Generate design error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate design direction' },
      { status: 500 }
    );
  }
}
