import Anthropic from '@anthropic-ai/sdk';

export interface ExtractedContent {
  companyName: string;
  tagline: string;
  problem: string;
  solution: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  cta: string;
  contactEmail: string;
  website: string;
}

const EXTRACTION_PROMPT = `You are an expert at analyzing pitch decks and extracting key information for creating landing pages.

Analyze the following pitch deck text and extract the information into a structured JSON format. Be concise but compelling - this content will be used on a landing page.

If certain information is not found, provide reasonable placeholder text that the user can edit later.

Return ONLY valid JSON in this exact format:
{
  "companyName": "The company name",
  "tagline": "A short, catchy tagline (create one if not found)",
  "problem": "1-2 sentences describing the problem being solved",
  "solution": "1-2 sentences describing the solution",
  "features": [
    {"title": "Feature 1", "description": "Brief description"},
    {"title": "Feature 2", "description": "Brief description"},
    {"title": "Feature 3", "description": "Brief description"}
  ],
  "cta": "Call-to-action text (e.g., 'Get Started', 'Book a Demo')",
  "contactEmail": "Contact email if found, otherwise empty string",
  "website": "Website URL if found, otherwise empty string"
}

Pitch deck content:
`;

export async function extractContent(pdfText: string): Promise<ExtractedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add your API key to .env.local');
  }

  const client = new Anthropic({
    apiKey,
  });

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + pdfText.slice(0, 15000), // Limit text length
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const extracted = JSON.parse(jsonMatch[0]) as ExtractedContent;

    // Ensure features array has at least 3 items
    while (extracted.features.length < 3) {
      extracted.features.push({
        title: `Feature ${extracted.features.length + 1}`,
        description: 'Add a description for this feature.',
      });
    }

    return extracted;
  } catch (error) {
    console.error('AI extraction error:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw error;
    }
    throw new Error('Failed to extract content. Please try again.');
  }
}
