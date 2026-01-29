import { NextRequest, NextResponse } from 'next/server';
import { parsePDF } from '@/lib/pdf-parser';
import { extractContent, ExtractedContent } from '@/lib/ai-extractor';

// Demo content for testing without API key
function getDemoContent(pdfText: string): ExtractedContent {
  // Try to extract company name from first line of PDF
  const firstLine = pdfText.split('\n').find(line => line.trim().length > 0) || 'Your Company';

  return {
    companyName: firstLine.trim().slice(0, 50),
    tagline: 'Transform the way you work',
    problem: 'Teams struggle with inefficient workflows and disconnected tools, leading to wasted time and missed opportunities.',
    solution: 'Our platform brings everything together in one place, making collaboration seamless and productivity effortless.',
    features: [
      { title: 'Smart Automation', description: 'Automate repetitive tasks and focus on what matters most.' },
      { title: 'Real-time Collaboration', description: 'Work together seamlessly with your team, no matter where they are.' },
      { title: 'Powerful Analytics', description: 'Get insights that help you make better decisions faster.' },
    ],
    cta: 'Get Started',
    contactEmail: 'hello@example.com',
    website: '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF to extract text
    const pdfText = await parsePDF(buffer);

    if (!pdfText.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The file may be image-based or corrupted.' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const hasValidKey = apiKey && apiKey !== 'your_api_key_here';

    let content: ExtractedContent;

    if (hasValidKey) {
      // Extract structured content using AI
      content = await extractContent(pdfText);
    } else {
      // Use demo content when no API key
      console.log('No API key configured - using demo mode');
      content = getDemoContent(pdfText);
    }

    return NextResponse.json({ content, demoMode: !hasValidKey });
  } catch (error) {
    console.error('Extract API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    );
  }
}
