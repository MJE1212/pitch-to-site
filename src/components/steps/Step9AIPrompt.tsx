'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function Step9AIPrompt() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [prompt, setPrompt] = useState<string>(project.aiBuilderPrompt?.prompt || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePrompt = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-ai-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckAnalysis: project.deckAnalysis,
          websitePurpose: project.websitePurpose,
          brandVoice: project.brandVoice,
          homepageContent: project.homepageContent,
          designDirection: project.designDirection,
          siteStructure: project.siteStructure,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate prompt');
      }

      const data = await response.json();
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    updateProject({ aiBuilderPrompt: { prompt } });
    nextStep();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!prompt && !isGenerating) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-3">Step 9: AI Builder Prompt</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Generate a ready-to-use prompt you can paste into Bolt.new, Lovable, or any AI website builder.
          </p>
        </div>

        {/* AI Builder Options */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Compatible AI Builders</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#e31837] transition-colors"
            >
              <div className="font-medium text-black mb-1">Bolt.new</div>
              <div className="text-sm text-neutral-500">Full-stack web apps</div>
            </a>
            <a
              href="https://lovable.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#e31837] transition-colors"
            >
              <div className="font-medium text-black mb-1">Lovable</div>
              <div className="text-sm text-neutral-500">Beautiful websites</div>
            </a>
            <a
              href="https://webflow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#e31837] transition-colors"
            >
              <div className="font-medium text-black mb-1">Webflow AI</div>
              <div className="text-sm text-neutral-500">Professional sites</div>
            </a>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <svg className="w-16 h-16 text-[#e31837] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="text-xl font-semibold text-black mb-2">Generate Builder Prompt</h2>
          <p className="text-neutral-500 mb-6">
            Create a comprehensive prompt that includes all your content, design specs, and structure.
          </p>
          <button
            onClick={generatePrompt}
            className="px-8 py-4 tough-tech-gradient text-black font-semibold rounded-lg transition-colors text-lg"
          >
            Generate AI Prompt
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-start">
          <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
            Back
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#e31837] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-700">Generating AI builder prompt...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-3">Step 9: AI Builder Prompt</h1>
        <p className="text-neutral-600">Copy this prompt and paste it into your AI website builder</p>
      </div>

      {/* Copy Button - Prominent */}
      <div className="flex justify-center">
        <button
          onClick={handleCopy}
          className={`px-8 py-4 font-semibold rounded-lg transition-colors text-lg flex items-center gap-3 ${
            copied
              ? 'bg-green-600 text-white'
              : 'tough-tech-gradient text-black'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Prompt to Clipboard
            </>
          )}
        </button>
      </div>

      {/* Prompt Preview */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 max-h-[500px] overflow-y-auto">
        <pre className="text-sm text-neutral-700 whitespace-pre-wrap">{prompt}</pre>
      </div>

      {/* Instructions */}
      <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
        <h3 className="font-medium text-black mb-2">How to use this prompt:</h3>
        <ol className="text-sm text-neutral-600 space-y-1 list-decimal list-inside">
          <li>Copy the prompt above</li>
          <li>Go to bolt.new, lovable.dev, or your preferred AI builder</li>
          <li>Paste the prompt and let it generate your site</li>
          <li>Iterate with follow-up instructions to refine</li>
        </ol>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={generatePrompt}
            className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Final Step
          </button>
        </div>
      </div>
    </div>
  );
}
