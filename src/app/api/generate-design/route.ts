import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Helper function to extract just the hex code from a string
function extractHexColor(colorString: string, fallback: string): string {
  if (!colorString) return fallback;
  const match = colorString.match(/#[0-9A-Fa-f]{6}\b/);
  return match ? match[0] : fallback;
}

export async function POST(request: NextRequest) {
  try {
    const { deckAnalysis, brandVoice, websitePurpose } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Extract any color codes from the deck text
    const rawText = deckAnalysis?.rawText || '';
    const hexColors = rawText.match(/#[0-9A-Fa-f]{6}\b/g) || [];
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
      ? `\n\nIMPORTANT: The pitch deck contains these brand colors: ${hexColors.join(', ')}. Use these as the primary/accent colors if they are appropriate for a professional website. Only suggest different colors if the deck colors are unsuitable.`
      : '\n\nNo brand colors were found in the pitch deck, so suggest appropriate colors following the Tough Tech standard (dark/muted primary, bright accent).';

    const prompt = `Help me define the visual design direction for the website. Use the "Tough Tech Website Standard" — a proven approach used by successful deep tech and science-driven startups — in conjunction with the color palette, typography and logo from the pitch deck.

Company: ${deckAnalysis?.elements?.companyName?.content || 'Tech Startup'}
Brand Personality: ${brandVoice?.personalityTraits?.join(', ') || 'Professional, Innovative, Trustworthy'}
${colorContext}

VISUAL STYLE Requirements:
- Color palette: Primary color (dark/muted for credibility), accent color (for CTAs), background colors. Include hex codes.
- Typography: Modern sans-serif
- Imagery style: Abstract/scientific visuals preferred over stock photography. Process diagrams, data visualizations, or subtle tech imagery.
- What to AVOID: Generic stock photos, cluttered layouts, playful/casual aesthetics (unless brand dictates otherwise).

TOUGH TECH STANDARD - Here are example sites that embody the standard approach:
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

IMPORTANT: For colorPalette, return ONLY the hex code (e.g., "#1e3a5f"), NOT descriptions.

Return JSON:
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
  "imageryStyle": "Description of imagery approach",
  "avoidList": ["Things to avoid"],
  "referenceWebsites": ["2-3 similar company website URLs"],
  "trustSignals": ["Which trust elements to feature"]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    const design = JSON.parse(jsonMatch[0]);

    // Clean up color values - extract just the hex codes
    if (design.colorPalette) {
      design.colorPalette = {
        primary: extractHexColor(design.colorPalette.primary, '#1e3a5f'),
        accent: extractHexColor(design.colorPalette.accent, '#3b82f6'),
        background: extractHexColor(design.colorPalette.background, '#ffffff'),
        text: extractHexColor(design.colorPalette.text, '#1f2937'),
      };
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
