import Anthropic from '@anthropic-ai/sdk';

/**
 * Wraps an Anthropic Messages API call with retry logic for transient overload errors.
 *
 * Anthropic returns HTTP 529 ("Overloaded") during peak-load periods. The SDK's
 * default auto-retry list covers 408/409/429/5xx but NOT the custom 529, so we
 * implement the retry ourselves.
 *
 * Retries up to `maxRetries` additional times after the initial attempt, with
 * exponential backoff (1s, 2s, 4s). On final failure, throws a user-friendly
 * error message instead of the raw SDK error so the caller can surface it
 * directly to the UI.
 *
 * Non-overloaded errors are re-thrown immediately (no retry).
 */
export async function withClaudeRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
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
