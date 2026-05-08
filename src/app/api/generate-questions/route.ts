import { NextResponse } from 'next/server';

// The 5 highest-leverage questions every Tough Tech founder should answer.
// These are deterministic (no model call) so the wizard always asks them in the same order.
// IDs are descriptive so the homepage prompt can reference them when needed.
const MUST_ASK_QUESTIONS = [
  {
    id: 'proof_point',
    question:
      'What is your single most defensible proof point? (Patent number, DOE/NSF grant name + amount, named pilot partner, published result with full title, awarded prize.)',
    context:
      'This is the strongest credibility signal we have for investors. Be specific — not "we have a grant" but "DOE ARPA-E grant, $1.5M, 2024."',
  },
  {
    id: 'why_now',
    question:
      "What's the technical breakthrough that makes this possible NOW, that wasn't possible 3 years ago?",
    context:
      'Investors need to understand the timing. What changed in the science, the supply chain, the cost curve, or the regulatory environment?',
  },
  {
    id: 'aesthetic_reference',
    question:
      'Name 1-2 websites — any company, any industry — that you wish your site looked like.',
    context:
      'This calibrates the visual direction better than any color picker. References can be from any sector — what matters is the feel, density, and confidence.',
  },
  {
    id: 'team_relevance',
    question:
      'For each team member: their most relevant prior credential for THIS specific problem (not a generic resume — why THEM for this).',
    context:
      'Example: "Sarah Chen, Co-founder/CTO — PhD MIT MechE, 8 years SpaceX cryogenic propulsion, 3 patents." Not "Sarah is a results-driven engineer."',
  },
  {
    id: 'do_not_emulate_sites',
    question:
      'Name 1–2 specific websites you do NOT want yours to look like (any company, any industry).',
    context:
      'Concrete anti-references help us avoid pulling toward the wrong aesthetic. "Not like [insert competitor site URL]" / "Not like Palantir" / "Not your typical [insert industry] corporate site." Skip if you don\'t have strong opinions.',
  },
];

export async function POST() {
  return NextResponse.json({ questions: MUST_ASK_QUESTIONS });
}
