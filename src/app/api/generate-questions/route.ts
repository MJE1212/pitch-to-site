import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { gaps, deckAnalysis } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode - return default questions
      return NextResponse.json({
        questions: [
          { id: 'q1', question: 'What specific problem does your solution address that existing solutions cannot?', context: 'This helps define your unique value proposition' },
          { id: 'q2', question: 'What credentials or experience make your team uniquely qualified to solve this problem?', context: 'Builds trust with investors and partners' },
          { id: 'q3', question: 'Do you have any early traction, pilots, or technical validation?', context: 'Provides credibility signals' },
        ],
      });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Based on the gaps you identified in the pitch deck, please generate the questions I need to answer to fill them.

Gaps identified: ${JSON.stringify(gaps)}

Focus on the most important gaps first:
- Anything related to my primary audience and their problems
- My unique value proposition and differentiators
- How my product/service actually works
- Trust and credibility elements
- Clear calls-to-action

Common questions you might ask:
- "What is the status quo or state-of-the-art that is not sufficient?"
- "What's the single most impressive benefit your product delivers?"
- "What credentials or experience make you the right team for this?"
- "Do you have any technical/scientific traction, papers, awards, or evidence that your solution is promising?"

Return JSON: {"questions": [{"id": "q1", "question": "...", "context": "Why this matters"}]}`;

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

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Generate questions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
