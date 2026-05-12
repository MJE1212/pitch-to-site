import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/pdf-parser';
import Anthropic from '@anthropic-ai/sdk';
import { DECK_ANALYSIS_PROMPT } from '@/lib/ai-prompts';
import { CLAUDE_MODEL } from '@/lib/model';

// Vision PDF analysis with Claude Opus can take 30–60s on large image-based decks.
// Vercel's default function timeout is 10s — bump to 60s.
export const maxDuration = 60;

// Tool-use schema for deck analysis. Forcing Claude to call this tool guarantees structured
// output and eliminates the entire class of "unescaped quote / newline in string value"
// JSON.parse failures we'd otherwise hit on free-form JSON responses. Anthropic's API
// validates the structure on its side.
const DECK_ELEMENT_SCHEMA = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['present', 'partial', 'missing'],
      description: 'Whether the element was found in the deck.',
    },
    content: {
      type: 'string',
      description: 'The verbatim extracted text for this element. Omit when status is "missing".',
    },
  },
  required: ['status'],
} as const;

const DECK_ANALYSIS_TOOL = {
  name: 'extract_deck_analysis',
  description:
    'Extract structured pitch-deck elements (company name, tagline, problem, solution, etc.) AND the brand colors visible in the deck. For each element, report status and the verbatim extracted content when present. Populate brandColors only when you can SEE the deck slides visually — leave it out when working from text only.',
  input_schema: {
    type: 'object' as const,
    properties: {
      elements: {
        type: 'object',
        properties: {
          companyName: DECK_ELEMENT_SCHEMA,
          tagline: DECK_ELEMENT_SCHEMA,
          problemStatement: DECK_ELEMENT_SCHEMA,
          solutionDescription: DECK_ELEMENT_SCHEMA,
          targetAudience: DECK_ELEMENT_SCHEMA,
          keyFeatures: DECK_ELEMENT_SCHEMA,
          howItWorks: DECK_ELEMENT_SCHEMA,
          differentiators: DECK_ELEMENT_SCHEMA,
          teamInfo: DECK_ELEMENT_SCHEMA,
          currentStatus: DECK_ELEMENT_SCHEMA,
          contactInfo: DECK_ELEMENT_SCHEMA,
        },
        required: [
          'companyName',
          'tagline',
          'problemStatement',
          'solutionDescription',
          'targetAudience',
          'keyFeatures',
          'howItWorks',
          'differentiators',
          'teamInfo',
          'currentStatus',
          'contactInfo',
        ],
      },
      brandColors: {
        type: 'object',
        description:
          'Brand colors observed in the deck\'s VISIBLE styling — the company logo, headline text color, recurring accent strokes, button/badge fills, and any consistent slide-background tint. Read the actual pixel colors; do NOT guess based on industry stereotypes (e.g., do not return teal just because the company is in sustainability). Only include this field when the deck is image-based and you can see the slides directly. Skip entirely if you are working from extracted text.',
        properties: {
          primary: {
            type: 'string',
            description:
              'The single dominant brand color — the one that, if you saw it on a billboard, would make a viewer think of THIS company. Hex code, 6 digits, lowercase OK (e.g., "#0a4d3a"). Pick the one used most prominently in the logo and across slides.',
          },
          accent: {
            type: 'string',
            description:
              'A secondary brand color used as an accent or highlight (e.g., callout fills, link color, secondary logo element). Hex code. Omit if the deck only uses one brand color.',
          },
          palette: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Up to 5 distinct brand-relevant hex codes observed across the deck, including the primary and accent. Exclude pure black (#000000), pure white (#ffffff), and generic grays UNLESS they are intentional brand colors (e.g., a black-on-white deck where black is the brand). Order: most prominent first.',
            maxItems: 5,
          },
        },
      },
    },
    required: ['elements'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try text extraction first
    let pdfText = '';
    try {
      pdfText = await parsePDF(buffer);
    } catch {
      // Text extraction failed, will use vision
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('[analyze-deck] API key status:', apiKey ? `present (length ${apiKey.length}, prefix ${apiKey.slice(0, 12)}...)` : 'MISSING');
    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode - return mock analysis
      return NextResponse.json({
        analysis: {
          elements: {
            companyName: { status: 'present', content: 'Demo Company' },
            tagline: { status: 'partial', content: 'Extracted from deck' },
            problemStatement: { status: 'present', content: 'Problem identified in deck' },
            solutionDescription: { status: 'present', content: 'Solution described in deck' },
            targetAudience: { status: 'partial', content: null },
            keyFeatures: { status: 'present', content: 'Features listed' },
            howItWorks: { status: 'missing', content: null },
            differentiators: { status: 'partial', content: null },
            teamInfo: { status: 'missing', content: null },
            currentStatus: { status: 'missing', content: null },
            contactInfo: { status: 'partial', content: null },
          },
          rawText: pdfText || 'Image-based PDF - analyzed via vision',
        },
        demoMode: true,
      });
    }

    const client = new Anthropic({ apiKey });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toolInput: any = null;

    // If we have substantial text, use text-based analysis; otherwise fall through to vision.
    const hasSubstantialText = pdfText.trim().length > 200;

    if (hasSubstantialText) {
      // Text-based analysis with tool-use for guaranteed-valid structured output.
      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        tools: [DECK_ANALYSIS_TOOL],
        tool_choice: { type: 'tool', name: 'extract_deck_analysis' },
        messages: [
          {
            role: 'user',
            content: DECK_ANALYSIS_PROMPT + pdfText.slice(0, 20000),
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const toolUseBlock = message.content.find((b) => b.type === 'tool_use');
      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        throw new Error('Claude did not return structured deck analysis.');
      }
      toolInput = toolUseBlock.input;
    } else {
      // Vision-based analysis - send PDF as document. Vercel's serverless ingress already
      // gates anything over ~4.5MB; Anthropic's API accepts up to 32MB per request.
      // Client-side compression in Step 2 keeps most decks well under either limit.
      console.log('Using document-based analysis for image PDF, size:', buffer.length);

      const pdfBase64 = buffer.toString('base64');

      try {
        const message = await client.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 2048,
          tools: [DECK_ANALYSIS_TOOL],
          tool_choice: { type: 'tool', name: 'extract_deck_analysis' },
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'document',
                  source: {
                    type: 'base64',
                    media_type: 'application/pdf',
                    data: pdfBase64,
                  },
                },
                {
                  type: 'text',
                  text: DECK_ANALYSIS_PROMPT,
                },
              ],
            },
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const toolUseBlock = message.content.find((b) => b.type === 'tool_use');
        if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
          throw new Error('Claude did not return structured deck analysis.');
        }
        toolInput = toolUseBlock.input;
        pdfText = '[Image-based PDF - analyzed via Claude Vision]';
      } catch (visionError) {
        console.error('Vision analysis failed:', visionError);
        throw new Error('Could not analyze this PDF. Please try compressing it or using a text-based PDF export.');
      }
    }

    const analysis = toolInput;
    analysis.rawText = pdfText;

    // Post-process the extracted company name in three passes:
    //   (1) Strip trailing parenthetical content. Claude vision often includes a visual
    //       interpretation of a stylized logo alongside the canonical name — e.g.
    //       "Rock Zero (R CK ZERO)" — because the logo replaces the "O" with a graphic.
    //   (2) Normalize stylistic periods between two real words. Logos like "Via.Separations"
    //       use a decorative dot between "Via" and "Separations"; we want the canonical
    //       "Via Separations" everywhere downstream. The pattern requires 3+ chars on each
    //       side so it doesn't touch abbreviations ("J.P. Morgan", "U.S. Steel") or
    //       domain-style names ("Stripe.com" — "com" doesn't start with a capital anyway).
    //   (3) Title-case the name if it came back fully lowercase, but leave ALL-CAPS and
    //       mixed-case alone so brand forms like "IBM", "OpenAI", or "iPhone" survive.
    const rawName = analysis?.elements?.companyName?.content;
    if (typeof rawName === 'string' && rawName.trim()) {
      const stripped = rawName.replace(/\s*\([^)]*\)\s*$/, '').trim();
      const dotNormalized = stripped.replace(
        /([A-Z][a-z]{2,})\.([A-Z][a-z]{2,})/g,
        '$1 $2'
      );
      const cleaned = dotNormalized || rawName.trim(); // never let cleanup return empty
      const cased = /[A-Z]/.test(cleaned)
        ? cleaned
        : cleaned.replace(/\b\w/g, (c: string) => c.toUpperCase());
      analysis.elements.companyName.content = cased;
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analyze deck error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze deck' },
      { status: 500 }
    );
  }
}
