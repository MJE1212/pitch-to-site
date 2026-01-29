import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { deckAnalysis, websitePurpose, brandVoice, contentGaps } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Build company info summary
    const companyName = deckAnalysis?.elements?.companyName?.content || 'Company';

    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode
      return NextResponse.json({
        content: {
          hero: {
            headline: `${companyName}: Transforming the Future`,
            alternativeHeadlines: [
              'The Next Generation Solution',
              'Breakthrough Technology for Tomorrow',
              'Redefining What\'s Possible',
            ],
            subheadline: brandVoice?.oneLiner || 'We help innovators achieve breakthrough results through cutting-edge technology.',
            primaryCTA: websitePurpose?.primaryCTA || 'Contact Us',
          },
          problem: {
            header: 'The Challenge',
            body: deckAnalysis?.elements?.problemStatement?.content || 'Current solutions fall short of meeting the demands of modern challenges, leaving organizations struggling with inefficiency and missed opportunities.',
          },
          solution: {
            header: 'Our Solution',
            body: deckAnalysis?.elements?.solutionDescription?.content || 'We\'ve developed a revolutionary approach that addresses these challenges head-on, delivering measurable results.',
          },
          benefits: [
            { headline: 'Breakthrough Performance', description: 'Achieve results that weren\'t possible before.' },
            { headline: 'Scientific Foundation', description: 'Built on rigorous research and proven methods.' },
            { headline: 'Expert Team', description: 'Led by world-class researchers and engineers.' },
          ],
          howItWorks: [
            { step: 1, title: 'Connect', description: 'Reach out to discuss your specific needs.' },
            { step: 2, title: 'Collaborate', description: 'Work with our team to develop a tailored solution.' },
            { step: 3, title: 'Transform', description: 'Implement and see breakthrough results.' },
          ],
          trustElements: ['University affiliations', 'Team credentials', 'Research publications'],
          finalCTA: {
            headline: 'Ready to Get Started?',
            buttonText: websitePurpose?.primaryCTA || 'Contact Us',
            supportingText: 'Join us in building the future.',
          },
        },
      });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Now please generate the homepage content based on everything we've discussed.

Company Info:
- Name: ${companyName}
- Problem: ${deckAnalysis?.elements?.problemStatement?.content || 'Not specified'}
- Solution: ${deckAnalysis?.elements?.solutionDescription?.content || 'Not specified'}
- Features: ${deckAnalysis?.elements?.keyFeatures?.content || 'Not specified'}

Brand Voice:
- One-liner: ${brandVoice?.oneLiner || 'Not specified'}
- Personality: ${brandVoice?.personalityTraits?.join(', ') || 'Professional, Innovative'}

Target Audience: Investors, talent, and early partners (pre-seed Tough Tech perspective)
Primary CTA: ${websitePurpose?.primaryCTA || 'Contact Us'}

Additional context from founder Q&A: ${JSON.stringify(contentGaps?.answers || {})}

Include:
1. HERO SECTION - A headline (under 10 words, attention-grabbing), 3 alternative headline options, a subheadline (1-2 sentences explaining what we do), a primary call-to-action button text
2. PROBLEM SECTION - A header with 2-3 sentences capturing the pain point our audience feels
3. SOLUTION SECTION - A header with 2-3 sentences on how we solve the problem
4. BENEFITS (3 items) - Each item with a short headline and 1-sentence description - Focus on outcomes, not features
5. HOW IT WORKS (3-4 steps) - Simple, clear steps showing the user journey
6. TRUST ELEMENTS - Suggest what social proof or credibility elements to include
7. FINAL CTA - Closing headline with button text and any supporting text

Make the tone match the brand personality we defined. Write for my primary audience.

Return JSON:
{
  "hero": {
    "headline": "Under 10 words, attention-grabbing",
    "alternativeHeadlines": ["Option 2", "Option 3", "Option 4"],
    "subheadline": "1-2 sentences explaining what we do",
    "primaryCTA": "Button text"
  },
  "problem": { "header": "Section header", "body": "2-3 sentences" },
  "solution": { "header": "Section header", "body": "2-3 sentences" },
  "benefits": [
    { "headline": "Short headline", "description": "1 sentence, focus on outcomes" }
  ],
  "howItWorks": [
    { "step": 1, "title": "Step title", "description": "Brief description" }
  ],
  "trustElements": ["Suggested trust signals"],
  "finalCTA": { "headline": "Closing headline", "buttonText": "Button text", "supportingText": "Supporting text" }
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse response');
    }

    return NextResponse.json({ content: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error('Generate homepage error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate homepage content' },
      { status: 500 }
    );
  }
}
