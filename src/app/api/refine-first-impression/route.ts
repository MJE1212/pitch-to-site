import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/model';

// Short Claude call but bump from 10s default for safety.
export const maxDuration = 60;

// Refines the "First Impression" / desired-feeling field on Step 4 (Brand Voice).
// Different from refine-oneliner: this is an emotional/feel sentence, not a what-we-do statement.
// Target output: short, evocative, brand-feel phrases like "Credible breakthrough. Worth a closer look."
export async function POST(request: NextRequest) {
  try {
    const { desiredFeeling, companyName, problemStatement, solutionDescription, personalityTraits } =
      await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode — return generic Tough Tech feel options.
      return NextResponse.json({
        suggestions: [
          'Credible breakthrough. Worth a closer look.',
          'Quietly confident. Built by people who know what they\'re doing.',
          'Serious science, plainly told.',
        ],
        feedback:
          'Your First Impression should capture the emotional response a visitor should have in the first 5 seconds — not what you do, but how it should feel.',
      });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Help refine this "First Impression" sentence for a Tough Tech company website.

The First Impression captures the emotional response a visitor should have in the first 5 seconds of landing on the homepage. It is NOT a tagline or a one-liner — it describes the FEELING, not the offering.

Current First Impression: "${desiredFeeling || 'Not provided'}"

Company context:
- Name: ${companyName || 'Not provided'}
- Problem they solve: ${problemStatement || 'Not provided'}
- Solution: ${solutionDescription || 'Not provided'}
- Brand personality traits: ${Array.isArray(personalityTraits) && personalityTraits.length > 0 ? personalityTraits.join(', ') : 'Not provided'}

Requirements for a great Tough Tech First Impression:
1. Two short sentences or fragments, total ≤14 words.
2. Captures FEELING (e.g., "credible breakthrough", "quiet confidence"), not what the company does.
3. Tonally consistent with the personality traits provided.
4. Tough Tech voice: understated, serious, no hyperbole. Avoid words like "revolutionary", "innovative", "cutting-edge".
5. Good examples: "Credible breakthrough. Worth a closer look." / "Serious science, plainly told." / "Quiet competence. No theatrics."
6. Bad examples: "We are transforming the future of biotech." (too generic, says what not feel) / "Revolutionary new platform." (banned hyperbole)

Return JSON only (no markdown fence, no prose):
{
  "suggestions": ["3 alternative First Impression options, each ≤14 words"],
  "feedback": "Brief feedback on the current First Impression and how to improve it"
}`;

    const message = await client.messages.create({
      model: CLAUDE_MODEL,
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
    console.error('Refine first-impression error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refine First Impression' },
      { status: 500 }
    );
  }
}
