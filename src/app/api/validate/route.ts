import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_MODEL } from '@/lib/model';
import { extractJsonObject } from '@/lib/json-extract';
import { VALIDATOR_RULES, ValidationResult } from '@/lib/validator-rules';

// 14-rule audit with one Claude call. Bump from 10s default.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { homepageContent, designDirection, deckAnalysis } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      // Demo mode: claim all rules pass so the wizard isn't blocked.
      const demoResult: ValidationResult = {
        results: VALIDATOR_RULES.map(r => ({ ruleId: r.id, status: 'pass' as const })),
        passedCount: VALIDATOR_RULES.length,
        totalCount: VALIDATOR_RULES.length,
      };
      return NextResponse.json({ validation: demoResult, demoMode: true });
    }

    if (!homepageContent) {
      return NextResponse.json(
        { error: 'No homepage content to validate. Complete Step 5 first.' },
        { status: 400 }
      );
    }

    const rulesBlock = VALIDATOR_RULES.map(
      r => `- ID "${r.id}" [${r.category}]: ${r.label}\n  ${r.detail}`
    ).join('\n');

    const prompt = `You are a strict editorial reviewer auditing a Tough Tech startup's website copy and design against a fixed checklist. The audit is BEFORE final blueprint export — we want to catch generic copy, banned buzzwords, vague claims, weak CTAs, and design fields that lack specifics.

=== HOMEPAGE CONTENT TO AUDIT ===
${JSON.stringify(homepageContent, null, 2)}

=== DESIGN DIRECTION TO AUDIT ===
${JSON.stringify(designDirection || {}, null, 2)}

=== TEAM INFO (from deck) ===
${deckAnalysis?.elements?.teamInfo?.content || '(no team data provided in deck — return team-domain-credentials with status="na")'}

=== CHECKLIST ===
For each rule below, return PASS, FAIL, or NA (only if the input data isn't available to evaluate).

${rulesBlock}

=== AUTO-FIXABLE vs HUMAN-FIXABLE — CRITICAL ===
For each FAIL, return BOTH \`fixPath\` (the dot-path to the offending field) AND \`fix\` (text). Then set \`needsInput\` to indicate which type of fix it is.

- AUTO-FIXABLE: \`needsInput: false\` (or omit). The \`fix\` is a LITERAL replacement value the UI can write directly into the field. Examples:
  • "Hero too long" → fix is a tighter rewrite of the existing hero (≤10 words).
  • "Banned word in benefit 2" → fix is the same description with the banned word replaced.
  • "Color value is 'navy'" → fix is "#0A2540" (a specific hex).
  • "Subhead 32 words" → fix is a tighter rewrite ≤25 words.

- HUMAN-FIXABLE: \`needsInput: true\`. The \`fix\` is GUIDANCE to the founder describing what to provide. The UI will show this as helper text alongside a manual-entry input. Examples:
  • "Trust signals are generic" with no specific grant/paper/uni in the input → fix is "Add the actual grant program name and award amount, e.g. 'NSF SBIR Phase I, $275K, 2024'." — guidance only.
  • "Problem section needs a stat" with no stat in inputs → fix is "Add a market-size figure or fraction-affected stat (e.g., 'eats 12% of operating budget')."

CRITICAL: NEVER write a "fix" value containing placeholder syntax like '[Founder Name]', '[University]', '[Grant amount]', or instruction phrases like "Replace this with...". Such strings would corrupt the field if applied. When the suggestion contains any bracket placeholder OR is phrased as advice rather than a value, set \`needsInput: true\`.

=== RESPONSE FORMAT — STRICT JSON ===
Return ONLY a JSON object in this exact shape (no prose, no markdown fence, no extra fields):

{
  "results": [
    {
      "ruleId": "exact-id-from-checklist",
      "status": "pass" | "fail" | "na",
      "quote": "Optional. If status==fail, quote the offending text or value (verbatim, ≤30 words).",
      "fix": "Optional. AUTO-FIXABLE: the literal replacement string. HUMAN-FIXABLE: a brief sentence describing what info the founder should provide.",
      "fixPath": "Optional. Dot-path like 'homepageContent.hero.headline' or 'homepageContent.benefits[1].description' or 'homepageContent.trustElements[0]' or 'designDirection.colorPalette.primary'. Include for ALL fixable failures.",
      "needsInput": "Optional boolean. Set to true ONLY when the fix is guidance and the founder must type the actual value. Default false."
    }
  ]
}

Include EVERY rule from the checklist (one entry per ruleId, in order). Do NOT add ruleIds that aren't in the checklist.`;

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = extractJsonObject(responseText);
    } catch (parseError) {
      console.error('[validate] JSON parse failed. Raw response:', responseText);
      throw parseError;
    }

    // Normalize: ensure every rule has a result; default missing to 'na'.
    const resultsById = new Map<string, unknown>();
    for (const r of parsed.results || []) {
      if (r && typeof r.ruleId === 'string') {
        resultsById.set(r.ruleId, r);
      }
    }

    const normalized = VALIDATOR_RULES.map(rule => {
      const found = resultsById.get(rule.id);
      if (!found || typeof found !== 'object') {
        return { ruleId: rule.id, status: 'na' as const };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = found as any;
      const status: 'pass' | 'fail' | 'na' =
        r.status === 'pass' || r.status === 'fail' || r.status === 'na' ? r.status : 'na';
      return {
        ruleId: rule.id,
        status,
        ...(r.quote ? { quote: String(r.quote) } : {}),
        ...(r.fix ? { fix: String(r.fix) } : {}),
        ...(r.fixPath ? { fixPath: String(r.fixPath) } : {}),
        ...(r.needsInput === true ? { needsInput: true } : {}),
      };
    });

    const passedCount = normalized.filter(r => r.status === 'pass').length;

    const validation: ValidationResult = {
      results: normalized,
      passedCount,
      totalCount: VALIDATOR_RULES.length,
    };

    return NextResponse.json({ validation });
  } catch (error) {
    console.error('Validate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to validate' },
      { status: 500 }
    );
  }
}
