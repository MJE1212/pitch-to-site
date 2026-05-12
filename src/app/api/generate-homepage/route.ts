import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/model';
import { withClaudeRetry } from '@/lib/anthropic-retry';

// Long Claude completion for full homepage copy. Bump from 10s default.
export const maxDuration = 60;

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

    const prompt = `Generate the homepage content for ${companyName}, a pre-seed Tough Tech company.

=== INPUTS ===
- Company name: ${companyName}
- Problem (from deck): ${deckAnalysis?.elements?.problemStatement?.content || 'Not specified'}
- Solution (from deck): ${deckAnalysis?.elements?.solutionDescription?.content || 'Not specified'}
- Key features (from deck): ${deckAnalysis?.elements?.keyFeatures?.content || 'Not specified'}
- Differentiators (from deck): ${deckAnalysis?.elements?.differentiators?.content || 'Not specified'}
- Team (from deck): ${deckAnalysis?.elements?.teamInfo?.content || 'Not specified'}
- Brand one-liner: ${brandVoice?.oneLiner || 'Not specified'}
- Brand personality: ${brandVoice?.personalityTraits?.join(', ') || 'Professional, credible'}
- Primary CTA wording: ${websitePurpose?.primaryCTA || 'Contact Us'}

=== HIGHEST-SIGNAL SOURCE — FOUNDER Q&A ANSWERS ===
These come from the founder directly and are the most important raw material. Treat verbatim phrases here as gold; use them in copy where appropriate:
${JSON.stringify(contentGaps?.answers || {}, null, 2)}

=== LOAD-BEARING INVESTOR BELIEF (highest priority anchor) ===
${websitePurpose?.firstTenSecondsBelief
  ? `Within 10 seconds of landing, an investor must believe THIS specific claim (provided by the founder):\n"${websitePurpose.firstTenSecondsBelief}"\n\nThe hero headline + subhead together MUST land this belief. Every other section should reinforce it.`
  : '(The founder did not provide a specific First-10-Seconds Belief. Derive one from the proof point in the Q&A answers above and anchor the hero on it.)'}

=== AUDIENCE & GOAL ===
The first visitor is a Series A investor evaluating defensibility, with engineering recruits as secondary. Within 10 seconds of landing, an investor must believe the load-bearing claim above.

=== BREVITY IS THE FIRST RULE ===
Tough Tech sites win on density, not length. Robigo's problem section is ONE sentence. Pascal's mechanism block is two. Foundation Alloy keeps each section to a single load-bearing claim. Word caps below are MAXIMUMS, not targets — go shorter when possible. If a sentence can be cut without losing meaning, cut it. If a paragraph has more than two sentences, ask whether the second is doing real work.

=== NON-NEGOTIABLE COPY RULES ===
1. Hero headline ≤10 words. Sweet spot: 5–6. State the outcome or category, not the technology category.
2. NEVER use these words anywhere in the output: revolutionary, revolutionizing, innovative, cutting-edge, next-generation, next-gen, transformative, disruptive, world-class, best-in-class, seamless, robust, powerful, AI-powered (as a buzzword), synergy, synergies, paradigm shift, game-changing, leveraging, empowering (unless followed by a concrete object).
3. Every claim must contain a number, a specific named entity, or a quoted fact. "Fast" is banned; "10× faster than electrochemical alternatives" is required. "Scalable" is banned; "deployable to 50+ sites in 12 months" is required.
4. Frame benefits by SUBTRACTION when possible: "eliminates melting and secondary processing" beats "advanced new method."
5. NEVER start a sentence with "We" in the Hero, Problem, Solution, or Benefits sections. Open with the noun, the outcome, or the incumbent. (Team bios and mission lines may use "We.")
6. Problem section must describe the CONSEQUENCE of inaction (cost, risk, missed opportunity), not just the problem.
7. Solution section must explain what the technology DOES, not what it IS. Include one analogy a non-expert would grasp, plus one specific technical claim experts can verify.
8. Subheadline formula (use this structure when possible): "[Company] [strong verb: invents / engineers / has developed / harnesses] [the noun] [for / required by / to power] [named markets]." Cap at 30 words.
9. Three-beat triplets are preferred for benefit headlines ("Stable. Simple. Modular."). The third item should reframe the first two.
10. Use "The result:" as a connective when introducing stacked benefits.

=== HERO HEADLINE FORMULAS — PICK ONE ===
- Outcome + qualifier: "Crop Protection Without Compromise"
- Category claim: "The 21st century metals company"
- Input → Output → Promise (staccato): "Rocks in. Lithium out. Zero waste."
- Outcome + scientific verb: "Identifying recurrence risk before cancer spreads"
- Contrarian declaration: "Novel superconductors the world actually needs"
- Capability sentence: "[Company] makes it possible to [verb] [object] from [substrate]"
- Mission as headline (only if no product yet): "We generate [thing] to [purpose]"

=== CTA WORDING — USE FROM THIS SAFE SET ===
"Contact Us" / "Get in touch" / "Reach Out" / "Get early access" / "Register Interest" / "Partner with us" / "How it works" / "See the technology" / "Meet the team"
NEVER use: "Learn More" / "Buy Now" / "Get Started" / "Sign Up Free" / "Try Now."

=== TRUST ELEMENTS — RANKED PREFERENCE FOR PRE-SEED ===
Suggest in this order, picking only what the founder actually has (do not invent):
1. Press pull-quotes (publication name + one-line excerpt)
2. University/lab attribution of underlying tech ("Underlying technology developed at MIT")
3. Government grants by name + amount ("DOE ARPA-E recipient, 2024 — one of 47 funded from 4,000 applicants")
4. Peer-reviewed papers cited by FULL TITLE
5. Named team credentials: degree + university + prior employer + patent count
6. Strategic investor or partner callout (only if real and named)
NEVER suggest: fake testimonials, imaginary investor logos, generic "trusted by" walls.

=== SELF-CHECK BEFORE RETURNING ===
For each field, ask: "Could this same sentence appear on a different company's website without anyone noticing?" If yes, rewrite until the answer is no.
Scan the full output for any banned word and replace it before returning.

=== OUTPUT JSON SHAPE — STRICT WORD CAPS ===
{
  "hero": {
    "headline": "≤10 words; sweet spot 5–6",
    "alternativeHeadlines": ["3 alternatives, each using a different formula"],
    "subheadline": "ONE sentence. ≤25 words. Names mechanism + named market.",
    "primaryCTA": "From the safe set above"
  },
  "problem": { "header": "≤6 words", "body": "≤40 words. Max 2 sentences. Lead with a specific number." },
  "solution": { "header": "≤6 words", "body": "≤45 words. Max 2 sentences. What the tech DOES + one specific technical claim." },
  "benefits": [
    { "headline": "≤4 words; triplet pattern preferred", "description": "≤15 words. One specific number or named comparison." }
  ],
  "howItWorks": [
    { "step": 1, "title": "≤3 words; verb-led", "description": "≤12 words. Concrete." }
  ],
  "trustElements": ["Specific items only — name the actual grant/paper/university/partner if known"],
  "finalCTA": { "headline": "≤8 words", "buttonText": "From safe set", "supportingText": "Optional. ≤12 words." }
}`;

    const message = await withClaudeRetry(() =>
      client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })
    );

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
