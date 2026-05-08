'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import {
  VALIDATOR_RULES,
  CATEGORY_LABELS,
  RuleCategory,
  RuleResult,
  ValidationResult,
} from '@/lib/validator-rules';

// Tokenize a path like "homepageContent.benefits[1].description" into navigable parts.
function pathTokens(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
}

// Read the value at a dot-path. Returns undefined if any step is missing.
function getAtPath(obj: unknown, path: string): unknown {
  const tokens = pathTokens(path);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = obj;
  for (const t of tokens) {
    if (cursor === null || cursor === undefined) return undefined;
    cursor = cursor[t];
  }
  return cursor;
}

// Write `value` at a dot-path; returns a new object (deep-cloned). Bails if the path doesn't resolve.
function setAtPath<T extends object>(obj: T, path: string, value: unknown): T {
  const tokens = pathTokens(path);
  const next = JSON.parse(JSON.stringify(obj));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cursor: any = next;
  for (let i = 0; i < tokens.length - 1; i++) {
    const key = tokens[i];
    if (cursor === null || cursor === undefined || cursor[key] === undefined) {
      return obj;
    }
    cursor = cursor[key];
  }
  cursor[tokens[tokens.length - 1]] = value;
  return next;
}

export default function Step10Validator() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Per-rule manual-edit text (the value the founder will Apply).
  const [edits, setEdits] = useState<Record<string, string>>({});
  // Per-rule error message shown when an Apply attempt fails (e.g., fixPath is missing
  // or doesn't resolve in the current project state). Without this the button silently
  // no-ops and the founder can't tell why nothing happened.
  const [applyErrors, setApplyErrors] = useState<Record<string, string>>({});

  const runValidation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homepageContent: project.homepageContent,
          designDirection: project.designDirection,
          deckAnalysis: project.deckAnalysis,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Validation failed');
      }
      const data = await res.json();
      const v: ValidationResult = data.validation;
      setValidation(v);

      // Initialize edit state for each fixable failure.
      // Auto-fixable: pre-fill with Claude's literal fix.
      // Human-fixable: leave blank — founder must type their own value.
      const newEdits: Record<string, string> = {};
      for (const r of v.results) {
        if (r.status === 'fail' && r.fixPath) {
          newEdits[r.ruleId] = r.needsInput ? '' : (r.fix || '');
        }
      }
      setEdits(newEdits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run once on mount.
  useEffect(() => {
    runValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const failures = useMemo(
    () => (validation?.results || []).filter(r => r.status === 'fail'),
    [validation]
  );

  const applyFix = (result: RuleResult) => {
    const value = edits[result.ruleId] ?? '';
    if (!value.trim()) return; // don't apply blank

    if (!result.fixPath) {
      setApplyErrors((e) => ({
        ...e,
        [result.ruleId]:
          'No automatic field path was returned for this issue. Edit the field manually in the relevant earlier step.',
      }));
      return;
    }

    const nextProject = setAtPath(project, result.fixPath, value);
    // setAtPath returns the original object (referentially) when the path didn't resolve.
    if (nextProject === project) {
      setApplyErrors((e) => ({
        ...e,
        [result.ruleId]: `Could not write to "${result.fixPath}". The field may not exist yet — please update it manually in the relevant earlier step.`,
      }));
      return;
    }

    // Success — clear any prior error and re-run validation.
    setApplyErrors((e) => {
      const next = { ...e };
      delete next[result.ruleId];
      return next;
    });
    updateProject(nextProject);
    runValidation();
  };

  // Group results by category for display.
  const grouped = useMemo(() => {
    const map = new Map<RuleCategory, { rule: typeof VALIDATOR_RULES[number]; result?: RuleResult }[]>();
    for (const rule of VALIDATOR_RULES) {
      const result = validation?.results.find(r => r.ruleId === rule.id);
      const list = map.get(rule.category) || [];
      list.push({ rule, result });
      map.set(rule.category, list);
    }
    return Array.from(map.entries());
  }, [validation]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#e31837] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-700">Auditing your copy and design…</p>
        <p className="text-neutral-500 text-sm mt-2">Checking against the Tough Tech rule set.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 10: Quality Check</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          We audit your copy and design against the Tough Tech rules before building the AI builder prompt. Apply suggested fixes, edit manually, or continue as-is.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {validation && (
        <>
          {/* Summary banner */}
          <div
            className={`rounded-xl border p-4 ${
              failures.length === 0
                ? 'bg-green-50 border-green-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <p
              className={`font-medium ${
                failures.length === 0 ? 'text-green-800' : 'text-amber-800'
              }`}
            >
              {failures.length === 0
                ? `✓ All ${validation.totalCount} checks passed.`
                : `${validation.passedCount} of ${validation.totalCount} checks passed · ${failures.length} ${failures.length === 1 ? 'issue' : 'issues'} to review`}
            </p>
            {failures.length > 0 && (
              <p className="text-sm text-amber-700 mt-1">
                Issues are warnings, not blockers. Apply individual fixes below or click <span className="font-medium">Continue to AI Prompt</span> to proceed as-is.
              </p>
            )}
          </div>

          {/* Grouped checklist */}
          {grouped.map(([category, items]) => (
            <div key={category} className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                {CATEGORY_LABELS[category]}
              </h2>
              <ul className="space-y-4">
                {items.map(({ rule, result }) => {
                  const status = result?.status || 'na';
                  const icon =
                    status === 'pass' ? '✓' : status === 'fail' ? '✗' : '–';
                  const iconColor =
                    status === 'pass'
                      ? 'text-green-600'
                      : status === 'fail'
                      ? 'text-red-600'
                      : 'text-neutral-400';
                  const fixable = status === 'fail' && !!result?.fixPath;
                  const editValue = edits[rule.id] ?? '';
                  // Show what's currently in the project at fixPath as a hint of context.
                  const currentValue = result?.fixPath
                    ? getAtPath(project, result.fixPath)
                    : undefined;
                  return (
                    <li key={rule.id}>
                      <div className="flex items-start gap-3">
                        <span className={`font-mono text-lg leading-tight ${iconColor}`}>
                          {icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-black">{rule.label}</p>
                          {status === 'fail' && result?.quote && (
                            <p className="text-sm text-neutral-600 mt-1">
                              <span className="text-neutral-500">Found:</span>{' '}
                              <span className="italic">&quot;{result.quote}&quot;</span>
                            </p>
                          )}
                          {status === 'fail' && result?.fix && (
                            <p className="text-sm text-neutral-700 mt-1">
                              <span className="text-neutral-500">
                                {result.needsInput ? 'You should provide:' : 'Suggest:'}
                              </span>{' '}
                              <span>{result.fix}</span>
                            </p>
                          )}
                          {fixable && (
                            <div className="mt-3 flex items-start gap-2">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEdits({ ...edits, [rule.id]: e.target.value })}
                                placeholder={
                                  result?.needsInput
                                    ? 'Type your replacement here…'
                                    : 'Edit before applying, if needed'
                                }
                                rows={2}
                                className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none resize-y"
                              />
                              <button
                                onClick={() => applyFix(result!)}
                                disabled={!editValue.trim()}
                                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                Apply
                              </button>
                            </div>
                          )}
                          {fixable && currentValue !== undefined && typeof currentValue === 'string' && currentValue !== result?.quote && (
                            <p className="text-xs text-neutral-400 mt-1 italic">
                              (current value at field: &quot;{String(currentValue).slice(0, 80)}{String(currentValue).length > 80 ? '…' : ''}&quot;)
                            </p>
                          )}
                          {applyErrors[rule.id] && (
                            <p className="text-xs text-red-600 mt-2">
                              {applyErrors[rule.id]}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-neutral-500 hover:text-black transition-colors"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={runValidation}
            disabled={isLoading}
            className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors disabled:opacity-50"
          >
            Re-run
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to AI Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
