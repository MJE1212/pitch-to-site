// Single source of truth for the Anthropic model used across all API routes.
// Override at deploy time by setting ANTHROPIC_MODEL in Vercel env vars.
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-7';
