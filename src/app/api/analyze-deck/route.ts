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
          'Brand colors observed across the deck\'s VISIBLE styling. The PDF is attached to this message as a document — you can see the slides directly. Count TOTAL VISUAL AREA covered, not just the logo: slide backgrounds, headline color treatments, recurring section dividers, callout/badge fills, button colors, accent strokes, large iconography. The logo is ONE signal, not the only one. If a color covers large slide areas but appears smaller in the logo, that color is still a brand color and should be included. Read the actual pixel colors; do NOT guess based on industry stereotypes (e.g., do not return teal just because the company is in sustainability). Always populate this field — you have visual access to the deck.',
        properties: {
          primary: {
            type: 'string',
            description:
              'The single most visually dominant brand color across the deck. Weight by area, not just logo. Hex code, 6 digits, lowercase OK (e.g., "#0a4d3a").',
          },
          accent: {
            type: 'string',
            description:
              'A secondary brand color used as an accent or highlight (callout fills, link color, secondary logo element). Hex code. Omit only if the deck genuinely uses one brand color.',
          },
          palette: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Up to 6 distinct brand-relevant hex codes observed across the deck, INCLUDING the primary and accent. Include EVERY color you see used consistently — if you see green on slide accents AND orange in the logo AND black in headlines, return all three. Better to over-include than miss a brand color. Exclude pure black (#000000), pure white (#ffffff), and generic grays UNLESS they are intentional brand colors. Order: most prominent first.',
            maxItems: 6,
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

    // Unified analysis path: always send the PDF as a vision document so Claude can read
    // brand colors and visual layout. Append any OCR-extracted text as supplementary
    // context so Claude can cross-reference layout-heavy or low-contrast slides. This
    // costs slightly more than the old text-only branch but eliminates the "brandColors
    // never populated for text-rich decks" failure mode.
    console.log('Analyzing deck (vision + optional text supplement), PDF size:', buffer.length);

    const pdfBase64 = buffer.toString('base64');
    const hasExtractedText = pdfText.trim().length > 0;
    const textBlockContent = hasExtractedText
      ? `${DECK_ANALYSIS_PROMPT}\n\n--- OCR TEXT EXTRACTED FROM THIS PDF (for reference; may have layout artifacts; cross-check against the visible slides) ---\n\n${pdfText.slice(0, 20000)}`
      : DECK_ANALYSIS_PROMPT;

    try {
      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        // 4096 tokens — large enough that an 11-element extraction PLUS brandColors with
        // a 6-color palette can't truncate the tool call. 2048 was right at the edge and
        // Anthropic returned partial tool inputs (empty .elements) when it ran out.
        max_tokens: 4096,
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
                text: textBlockContent,
              },
            ],
          },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const toolUseBlock = message.content.find((b) => b.type === 'tool_use');
      if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
        console.error('[analyze-deck] No tool_use block in response. stop_reason:', message.stop_reason, 'content types:', message.content.map((b) => b.type));
        throw new Error('Claude did not return structured deck analysis.');
      }
      toolInput = toolUseBlock.input;

      // Validate the tool call actually populated elements. If max_tokens was hit mid-call,
      // Anthropic returns an incomplete input with missing required fields. Fail loudly
      // here instead of letting the wizard show "Found 0 elements" with no explanation.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elements = (toolInput as any)?.elements;
      if (!elements || typeof elements !== 'object' || Object.keys(elements).length === 0) {
        console.error('[analyze-deck] tool_use input missing or empty .elements. stop_reason:', message.stop_reason, 'input:', JSON.stringify(toolInput).slice(0, 500));
        throw new Error(
          message.stop_reason === 'max_tokens'
            ? 'Deck analysis was truncated. Try a shorter deck or contact support.'
            : 'Deck analysis came back empty. Please try uploading again.'
        );
      }
    } catch (visionError) {
      console.error('Deck analysis failed:', visionError);
      throw visionError instanceof Error
        ? visionError
        : new Error('Could not analyze this PDF. Please try compressing it or using a text-based PDF export.');
    }

    // rawText: keep extracted PDF text if any (downstream prompts reference it) or mark
    // that vision was the sole source.
    if (!hasExtractedText) {
      pdfText = '[Analyzed via Claude Vision]';
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
