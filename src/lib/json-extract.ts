/**
 * Robust JSON object extractor for LLM responses.
 *
 * Handles three common patterns:
 *  1. Pure JSON: `{"foo": 1}`
 *  2. JSON wrapped in a markdown fence: ```json\n{...}\n```
 *  3. JSON with prose before/after: "Here's the result: {...}\nLet me know if..."
 *
 * The naive `text.match(/\{[\s\S]*\}/)` is greedy and pulls from the first `{`
 * to the LAST `}` in the entire response, which breaks whenever the model adds
 * trailing prose containing a closing brace.
 *
 * This implementation walks the text with a depth counter (string-aware) to
 * extract the FIRST complete top-level JSON object.
 */
export function extractJsonObject<T = unknown>(rawText: string): T {
  let text = rawText.trim();

  // Strip a leading markdown code fence if present.
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json|JSON)?\s*\n?/, '').replace(/\n?\s*```\s*$/, '');
  }

  // Fast path: the whole (post-fence-strip) text might be valid JSON.
  try {
    return JSON.parse(text) as T;
  } catch {
    // Fall through to brace-walking.
  }

  const start = text.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object found in response');
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < text.length; i++) {
    const c = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (c === '\\') {
      escapeNext = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(start, i + 1);
        return JSON.parse(candidate) as T;
      }
    }
  }

  throw new Error('Unterminated JSON object in response');
}
