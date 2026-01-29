'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';

export default function Step8SpecDocument() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [specMarkdown, setSpecMarkdown] = useState<string>(project.specDocument?.markdown || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSpec = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckAnalysis: project.deckAnalysis,
          websitePurpose: project.websitePurpose,
          brandVoice: project.brandVoice,
          contentGaps: project.contentGaps,
          homepageContent: project.homepageContent,
          designDirection: project.designDirection,
          siteStructure: project.siteStructure,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate spec');
      }

      const data = await response.json();
      setSpecMarkdown(data.markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate spec');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    updateProject({ specDocument: { markdown: specMarkdown } });
    nextStep();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(specMarkdown);
  };

  const handleDownload = () => {
    const blob = new Blob([specMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-spec.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!specMarkdown && !isGenerating) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-3">Step 8: Spec Document</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Generate a comprehensive specification document you can hand to a developer or use as reference.
          </p>
        </div>

        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <svg className="w-16 h-16 text-[#e31837] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-black mb-2">Generate Specification</h2>
          <p className="text-neutral-500 mb-6">
            This document will include project overview, brand guidelines, site structure, all content, design notes, and technical requirements.
          </p>
          <button
            onClick={generateSpec}
            className="px-8 py-4 tough-tech-gradient text-black font-semibold rounded-lg transition-colors text-lg"
          >
            Generate Spec Document
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
        <p className="text-neutral-700">Generating specification document...</p>
        <p className="text-neutral-500 text-sm mt-2">This may take a moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-3">Step 8: Spec Document</h1>
        <p className="text-neutral-600">Your website specification - save this!</p>
      </div>

      {/* Actions Bar */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleCopy}
          className="px-4 py-2 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download .md
        </button>
      </div>

      {/* Spec Preview */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 max-h-[600px] overflow-y-auto">
        <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">{specMarkdown}</pre>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={generateSpec}
            className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Step 9
          </button>
        </div>
      </div>
    </div>
  );
}
