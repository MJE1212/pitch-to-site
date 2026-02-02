import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/pdf-parser';
import Anthropic from '@anthropic-ai/sdk';
import { DECK_ANALYSIS_PROMPT } from '@/lib/ai-prompts';

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
        model: 'claude-sonnet-4-20250514',
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
      // Vision-based analysis - send PDF as document
      console.log('Using document-based analysis for image PDF, size:', buffer.length);

      const pdfBase64 = buffer.toString('base64');

      try {
        const message = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          betas: ['pdfs-2024-09-25'],
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
        throw new Error('Could not analyze this PDF. It may be too large or in an unsupported format. Please try a smaller file or a text-based PDF.');
      }
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    analysis.rawText = pdfText;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analyze deck error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze deck' },
      { status: 500 }
    );
  }
}
