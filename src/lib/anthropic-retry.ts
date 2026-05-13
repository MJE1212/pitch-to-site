import Anthropic from '@anthropic-ai/sdk';

/**
 * Wraps an Anthropic Messages API call with retry logic for transient overload errors.
 *
 * Anthropic returns HTTP 529 ("Overloaded") during peak-load periods. The SDK's
 * default auto-retry list covers 408/409/429/5xx but NOT the custom 529, so we
 * implement the retry ourselves.
 *
 * Default maxRetries=1 (so 2 total attempts) to stay safely under Vercel's 60s
 * function timeout. The longest single Claude call we make is the vision-based
 * deck analysis at ~15–30s. With 2 attempts plus a 1s backoff that's worst-case
 * ~61s — tight but usually well under. Higher retry counts risked running over
 * the function timeout, which manifests to the user as a generic "Server returned
 * an invalid response" because Vercel kills the function and returns HTML.
 *
 * Caller can pass a smaller or larger `maxRetries` per call site. Backoff is
 * exponential: 1s before retry 1, 2s before retry 2, 4s before retry 3, etc.
 *
 * Non-overloaded errors are re-thrown immediately (no retry).
 * On final failure with 529, throws a user-friendly error message so the
 * caller can surface it directly to the UI.
 */
export async function withClaudeRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 1
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isOverloaded = isOverloadedError(err);
      if (!isOverloaded) {
        throw err;
      }
      if (attempt === maxRetries) {
        // All retries exhausted — throw a clean message the UI can show as-is.
        throw new Error(
          "Anthropic's API is temporarily overloaded. Please wait a moment and try again."
        );
      }
      const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      console.log(
        `[withClaudeRetry] Anthropic overloaded (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function isOverloadedError(err: unknown): boolean {
  if (err instanceof Anthropic.APIError && err.status === 529) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('overloaded') || msg.includes('529')) return true;
  }
  return false;
}
