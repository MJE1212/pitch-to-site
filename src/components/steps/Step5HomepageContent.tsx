'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { HomepageContent } from '@/lib/types';

export default function Step5HomepageContent() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [content, setContent] = useState<HomepageContent | null>(project.homepageContent || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckAnalysis: project.deckAnalysis,
          websitePurpose: project.websitePurpose,
          brandVoice: project.brandVoice,
          contentGaps: project.contentGaps,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate content');
      }

      const data = await response.json();
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (content) {
      updateProject({ homepageContent: content });
      nextStep();
    }
  };

  const updateSection = (section: 'hero' | 'problem' | 'solution' | 'finalCTA', field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: { ...content[section], [field]: value },
    });
  };

  const updateBenefit = (index: number, field: 'headline' | 'description', value: string) => {
    if (!content) return;
    const newBenefits = [...content.benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    setContent({ ...content, benefits: newBenefits });
  };

  const updateStep = (index: number, field: 'title' | 'description', value: string) => {
    if (!content) return;
    const newSteps = [...content.howItWorks];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setContent({ ...content, howItWorks: newSteps });
  };

  if (!content && !isGenerating) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-3">Step 5: Homepage Content</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Generate all the copy for your homepage based on everything we've gathered.
          </p>
        </div>

        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <svg className="w-16 h-16 text-[#e31837] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-xl font-semibold text-black mb-2">Ready to Generate</h2>
          <p className="text-neutral-500 mb-6">
            We'll create headlines, descriptions, and CTAs based on your deck analysis, brand voice, and answers.
          </p>
          <button
            onClick={generateContent}
            className="px-8 py-4 tough-tech-gradient text-black font-semibold rounded-lg transition-colors text-lg"
          >
            Generate Homepage Content
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
        <p className="text-neutral-700">Generating your homepage content...</p>
        <p className="text-neutral-500 text-sm mt-2">This may take a moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-3">Step 5: Homepage Content</h1>
        <p className="text-neutral-600">Review and edit your generated content. Click Edit on any section to modify.</p>
      </div>

      {/* Hero Section */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Hero Section</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingSection === 'hero' ? 'Done' : 'Edit'}
          </button>
        </div>

        {editingSection === 'hero' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Headline</label>
              <input
                value={content?.hero.headline || ''}
                onChange={(e) => updateSection('hero', 'headline', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Subheadline</label>
              <textarea
                value={content?.hero.subheadline || ''}
                onChange={(e) => updateSection('hero', 'subheadline', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">CTA Button Text</label>
              <input
                value={content?.hero.primaryCTA || ''}
                onChange={(e) => updateSection('hero', 'primaryCTA', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-black">{content?.hero.headline}</h3>
            <p className="text-neutral-600">{content?.hero.subheadline}</p>
            <span className="inline-block px-4 py-2 bg-black text-white rounded-lg text-sm">
              {content?.hero.primaryCTA}
            </span>
          </div>
        )}
      </div>

      {/* Problem Section */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Problem Section</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'problem' ? null : 'problem')}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingSection === 'problem' ? 'Done' : 'Edit'}
          </button>
        </div>

        {editingSection === 'problem' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Header</label>
              <input
                value={content?.problem.header || ''}
                onChange={(e) => updateSection('problem', 'header', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Body</label>
              <textarea
                value={content?.problem.body || ''}
                onChange={(e) => updateSection('problem', 'body', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black resize-none"
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-medium text-black mb-1">{content?.problem.header}</h3>
            <p className="text-neutral-500">{content?.problem.body}</p>
          </>
        )}
      </div>

      {/* Solution Section */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Solution Section</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'solution' ? null : 'solution')}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingSection === 'solution' ? 'Done' : 'Edit'}
          </button>
        </div>

        {editingSection === 'solution' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Header</label>
              <input
                value={content?.solution.header || ''}
                onChange={(e) => updateSection('solution', 'header', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Body</label>
              <textarea
                value={content?.solution.body || ''}
                onChange={(e) => updateSection('solution', 'body', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black resize-none"
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-medium text-black mb-1">{content?.solution.header}</h3>
            <p className="text-neutral-500">{content?.solution.body}</p>
          </>
        )}
      </div>

      {/* Benefits */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Benefits</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'benefits' ? null : 'benefits')}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingSection === 'benefits' ? 'Done' : 'Edit'}
          </button>
        </div>

        {editingSection === 'benefits' ? (
          <div className="space-y-4">
            {content?.benefits.map((benefit, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-neutral-200 space-y-3">
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">Headline {index + 1}</label>
                  <input
                    value={benefit.headline}
                    onChange={(e) => updateBenefit(index, 'headline', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">Description</label>
                  <textarea
                    value={benefit.description}
                    onChange={(e) => updateBenefit(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {content?.benefits.map((benefit, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-neutral-200">
                <h3 className="font-medium text-black mb-1">{benefit.headline}</h3>
                <p className="text-sm text-neutral-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">How It Works</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'howItWorks' ? null : 'howItWorks')}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingSection === 'howItWorks' ? 'Done' : 'Edit'}
          </button>
        </div>

        {editingSection === 'howItWorks' ? (
          <div className="space-y-4">
            {content?.howItWorks.map((step, index) => (
              <div key={step.step} className="p-4 bg-white rounded-lg border border-neutral-200 space-y-3">
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">Step {step.step} Title</label>
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-500 mb-1">Description</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {content?.howItWorks.map((step) => (
              <div key={step.step} className="flex gap-4 items-start">
                <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-medium text-black">{step.title}</h3>
                  <p className="text-sm text-neutral-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final CTA */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Final CTA Section</h2>
          <button
            onClick={() => setEditingSection(editingSection === 'finalCTA' ? null : 'finalCTA')}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingSection === 'finalCTA' ? 'Done' : 'Edit'}
          </button>
        </div>

        {editingSection === 'finalCTA' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Headline</label>
              <input
                value={content?.finalCTA.headline || ''}
                onChange={(e) => updateSection('finalCTA', 'headline', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Supporting Text</label>
              <textarea
                value={content?.finalCTA.supportingText || ''}
                onChange={(e) => updateSection('finalCTA', 'supportingText', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1">Button Text</label>
              <input
                value={content?.finalCTA.buttonText || ''}
                onChange={(e) => updateSection('finalCTA', 'buttonText', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-black mb-2">{content?.finalCTA.headline}</h3>
            <p className="text-neutral-500 mb-3">{content?.finalCTA.supportingText}</p>
            <span className="inline-block px-4 py-2 bg-black text-white rounded-lg text-sm">
              {content?.finalCTA.buttonText}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={generateContent}
            className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Step 6
          </button>
        </div>
      </div>
    </div>
  );
}
