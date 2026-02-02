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
    const pdfText = await parsePDF(buffer);

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The file may be image-based.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode - return mock analysis
      return NextResponse.json({
        analysis: {
          elements: {
            companyName: { status: 'present', content: pdfText.split('\n')[0]?.trim() || 'Company Name' },
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
          rawText: pdfText,
        },
        demoMode: true,
      });
    }

    const client = new Anthropic({ apiKey });
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

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
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
