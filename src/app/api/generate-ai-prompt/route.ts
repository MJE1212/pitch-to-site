import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json();
    const { deckAnalysis, brandVoice, designDirection, siteStructure, homepageContent, websitePurpose } = projectData;

    const companyName = deckAnalysis?.elements?.companyName?.content || 'Company';

    const buildPrompt = () => {
      return `Create a professional single-page website for ${companyName}, a Tough Tech startup.

=== BRAND & STYLE ===
- Style: Clean, professional, credible - following the "Tough Tech Website Standard"
- Colors: Primary ${designDirection?.colorPalette?.primary || '#1e3a5f'}, Accent ${designDirection?.colorPalette?.accent || '#3b82f6'}, Background ${designDirection?.colorPalette?.background || '#ffffff'}
- Typography: ${designDirection?.typography?.headingFont || 'Inter'} for headings, ${designDirection?.typography?.bodyFont || 'Inter'} for body
- Imagery: ${designDirection?.imageryStyle || 'Abstract scientific visuals, avoid generic stock photos'}
- Personality: ${brandVoice?.personalityTraits?.join(', ') || 'Professional, Innovative, Trustworthy'}

=== NAVIGATION ===
Header with logo and nav items: ${siteStructure?.navigationItems?.join(', ') || 'About, Technology, Team, Contact Us'}
Primary CTA button: "${homepageContent?.hero?.primaryCTA || websitePurpose?.primaryCTA || 'Contact Us'}"

=== HERO SECTION ===
Headline: "${homepageContent?.hero?.headline || companyName}"
Subheadline: "${homepageContent?.hero?.subheadline || brandVoice?.oneLiner || 'Breakthrough technology for tomorrow'}"
CTA Button: "${homepageContent?.hero?.primaryCTA || 'Contact Us'}"
- Large, confident headline with generous whitespace
- Dark/muted background with light text OR light background with dark text

=== PROBLEM SECTION ===
Header: "${homepageContent?.problem?.header || 'The Challenge'}"
Body: "${homepageContent?.problem?.body || 'Current solutions fall short.'}"

=== SOLUTION SECTION ===
Header: "${homepageContent?.solution?.header || 'Our Solution'}"
Body: "${homepageContent?.solution?.body || 'We have developed a revolutionary approach.'}"

=== BENEFITS SECTION ===
3 benefit cards in a row:
${homepageContent?.benefits?.map((b: { headline: string; description: string }, i: number) =>
  `${i + 1}. "${b.headline}" - "${b.description}"`
).join('\n') || '1. "Breakthrough Performance" - "Achieve results that weren\'t possible before."'}

=== HOW IT WORKS SECTION ===
${homepageContent?.howItWorks?.map((s: { step: number; title: string; description: string }) =>
  `Step ${s.step}: "${s.title}" - "${s.description}"`
).join('\n') || 'Step 1: "Connect" - "Reach out to discuss your needs"'}

=== TEAM SECTION (optional) ===
Simple grid of team members with photos, names, and titles

=== FINAL CTA SECTION ===
Headline: "${homepageContent?.finalCTA?.headline || 'Ready to Get Started?'}"
Supporting text: "${homepageContent?.finalCTA?.supportingText || 'Join us in building the future.'}"
Button: "${homepageContent?.finalCTA?.buttonText || 'Contact Us'}"
- High contrast background (dark with light text)

=== FOOTER ===
Company name, copyright, links: ${siteStructure?.footerItems?.join(', ') || 'Privacy Policy, LinkedIn, Contact'}
${websitePurpose?.linkedInUrl ? `LinkedIn: ${websitePurpose.linkedInUrl}` : ''}
${websitePurpose?.twitterUrl ? `Twitter: ${websitePurpose.twitterUrl}` : ''}

=== TECHNICAL REQUIREMENTS ===
- Fully responsive (mobile-first)
- Smooth scroll navigation
- Contact form or mailto link
- Fast loading
- SEO meta tags with description: "${brandVoice?.oneLiner || 'Breakthrough technology startup'}"

=== WHAT TO AVOID ===
${designDirection?.avoidList?.map((item: string) => `- ${item}`).join('\n') || '- Generic stock photos\n- Cluttered layouts'}

Generate a complete, working website with all the above content and styling.`;
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ prompt: buildPrompt() });
    }

    // With API key, we can polish the prompt
    const client = new Anthropic({ apiKey });

    const prompt = `Now create a ready-to-use prompt I can paste into an AI website builder like Bolt.new, Lovable, or Webflow AI. Improve this AI website builder prompt to be more effective. Keep all the content but make it clearer and more comprehensive. The goal is: I paste this prompt, and I get a working website. Make it comprehensive but not bloated. Include everything needed, nothing extra. Return only the improved prompt text.

${buildPrompt()}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : buildPrompt();

    return NextResponse.json({ prompt: responseText });
  } catch (error) {
    console.error('Generate AI prompt error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
