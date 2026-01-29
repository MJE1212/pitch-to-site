import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { oneLiner, companyName, problemStatement, solutionDescription } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode - return suggestions based on inputs
      return NextResponse.json({
        suggestions: [
          `${companyName || 'We'} helps [target customer] achieve [specific outcome] through [unique approach].`,
          `Breakthrough [technology type] that enables [key benefit] for [industry].`,
          `The [adjective] solution for [problem space] - [key differentiator].`,
        ],
        feedback: 'Your one-liner should clearly communicate what you do, who you serve, and what makes you different.',
      });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Help refine this startup one-liner for a Tough Tech company website.

Current one-liner: "${oneLiner || 'Not provided'}"

Company context:
- Name: ${companyName || 'Not provided'}
- Problem they solve: ${problemStatement || 'Not provided'}
- Solution: ${solutionDescription || 'Not provided'}

Requirements for a great Tough Tech one-liner:
1. Under 15 words
2. Clearly states what the company does
3. Implies the target customer or market
4. Hints at the unique advantage
5. Sounds credible and professional (not hyperbolic)

Return JSON:
{
  "suggestions": ["3 alternative one-liner options"],
  "feedback": "Brief feedback on the current one-liner and how to improve it"
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

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error) {
    console.error('Refine one-liner error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refine one-liner' },
      { status: 500 }
    );
  }
}
