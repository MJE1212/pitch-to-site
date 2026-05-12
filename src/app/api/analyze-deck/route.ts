import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/pdf-parser';
import Anthropic from '@anthropic-ai/sdk';
import { DECK_ANALYSIS_PROMPT } from '@/lib/ai-prompts';
import { CLAUDE_MODEL } from '@/lib/model';

// Vision PDF analysis with Claude Opus can take 30–60s on large image-based decks.
// Vercel's default function timeout is 10s — bump to 60s.
export const maxDuration = 60;

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
    let responseText: string;

    // If we have substantial text, use text-based analysis
    const hasSubstantialText = pdfText.trim().length > 200;

    if (hasSubstantialText) {
      // Text-based analysis
      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: DECK_ANALYSIS_PROMPT + pdfText.slice(0, 20000),
          },
        ],
      });
      responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    } else {
      // Vision-based analysis - send PDF as document.
      // No artificial size cap here: Vercel's serverless ingress already gates
      // anything over ~4.5MB (returns FUNCTION_PAYLOAD_TOO_LARGE before we run),
      // and Anthropic's API accepts up to 32MB per request. Client-side
      // compression in Step 2 keeps most decks well under either limit.
      console.log('Using document-based analysis for image PDF, size:', buffer.length);

      const pdfBase64 = buffer.toString('base64');

      try {
        const message = await client.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: 2048,
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
        responseText = message.content[0].type === 'text' ? message.content[0].text : '';
        pdfText = '[Image-based PDF - analyzed via Claude Vision]';
      } catch (visionError) {
        console.error('Vision analysis failed:', visionError);
        throw new Error('Could not analyze this PDF. Please try compressing it or using a text-based PDF export.');
      }
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
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
