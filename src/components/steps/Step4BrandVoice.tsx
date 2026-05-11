'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { BrandVoice, AestheticArchetype } from '@/lib/types';

const ARCHETYPES: { value: AestheticArchetype; label: string; description: string; refs: string }[] = [
  {
    value: 'cold-precise',
    label: 'Cold / precise',
    description: 'Restrained, technical, almost editorial. Lots of whitespace, monospace data, near-monochrome palette.',
    refs: 'Cohere · DeepMind · Pascal',
  },
  {
    value: 'bold-mission',
    label: 'Bold / mission-driven',
    description: 'Big claims, declarative tone, mission-as-headline. Higher contrast palette, confident visual scale.',
    refs: 'Impossible Foods · Anduril · Anthology',
  },
  {
    value: 'credible-academic',
    label: 'Credible / academic',
    description: 'Cite-the-paper voice. Numbered sections, peer-review references, dense data callouts.',
    refs: 'Recursion · BioAtla · Foundation Alloy',
  },
  {
    value: 'lean-scrappy',
    label: 'Lean / scrappy',
    description: 'YC demo-day energy. Short sentences, single-stat strips, minimal chrome, get-to-the-point.',
    refs: 'Rock Zero · Robigo · early-stage YC sites',
  },
];

const PERSONALITY_OPTIONS = [
  'Professional', 'Bold', 'Technical', 'Innovative', 'Trustworthy',
  'Warm', 'Edgy', 'Rigorous', 'Visionary', 'Grounded', 'Resourceful',
  'Expert', 'Inspiring'
];

export default function Step4BrandVoice() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  // Extract one-liner from deck analysis if available
  const extractedOneLiner = project.deckAnalysis?.elements?.tagline?.content ||
    project.deckAnalysis?.elements?.solutionDescription?.content || '';

  // Short, generic default — the founder edits this to taste.
  // Previously we prepended differentiators content, which produced very long auto-fills.
  const extractedFeeling = 'Credible breakthrough. Worth a closer look.';

  const [brandVoice, setBrandVoice] = useState<BrandVoice>(
    project.brandVoice || {
      oneLiner: extractedOneLiner,
      personalityTraits: [],
      desiredFeeling: extractedFeeling,
    }
  );

  const [customTraits, setCustomTraits] = useState<string[]>(
    project.brandVoice?.personalityTraits?.filter(t => !PERSONALITY_OPTIONS.includes(t)) || []
  );
  const [newCustomTrait, setNewCustomTrait] = useState('');

  const [isRefining, setIsRefining] = useState(false);
  const [isRefiningFirstImpression, setIsRefiningFirstImpression] = useState(false);

  // Update brandVoice when custom traits change
  useEffect(() => {
    const presetTraits = brandVoice.personalityTraits.filter(t => PERSONALITY_OPTIONS.includes(t));
    setBrandVoice(prev => ({
      ...prev,
      personalityTraits: [...presetTraits, ...customTraits],
    }));
  }, [customTraits]);

  const toggleTrait = (trait: string) => {
    const currentPresetTraits = brandVoice.personalityTraits.filter(t => PERSONALITY_OPTIONS.includes(t));
    const newPresetTraits = currentPresetTraits.includes(trait)
      ? currentPresetTraits.filter(t => t !== trait)
      : [...currentPresetTraits, trait].slice(0, 5 - customTraits.length);
    setBrandVoice({
      ...brandVoice,
      personalityTraits: [...newPresetTraits, ...customTraits]
    });
  };

  const addCustomTrait = () => {
    const trimmed = newCustomTrait.trim();
    if (trimmed && customTraits.length < 5 && !customTraits.includes(trimmed) && !PERSONALITY_OPTIONS.includes(trimmed)) {
      const totalTraits = brandVoice.personalityTraits.filter(t => PERSONALITY_OPTIONS.includes(t)).length + customTraits.length;
      if (totalTraits < 5) {
        setCustomTraits([...customTraits, trimmed]);
        setNewCustomTrait('');
      }
    }
  };

  const removeCustomTrait = (trait: string) => {
    setCustomTraits(customTraits.filter(t => t !== trait));
  };

  const handleRefineOneLiner = async () => {
    if (!brandVoice.oneLiner.trim()) return;

    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-oneliner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oneLiner: brandVoice.oneLiner,
          companyName: project.deckAnalysis?.elements?.companyName?.content,
          problemStatement: project.deckAnalysis?.elements?.problemStatement?.content,
          solutionDescription: project.deckAnalysis?.elements?.solutionDescription?.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setBrandVoice({ ...brandVoice, oneLiner: data.suggestions[0] });
        }
      }
    } catch (error) {
      console.error('Failed to refine one-liner:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleRefineFirstImpression = async () => {
    if (!brandVoice.desiredFeeling.trim()) return;

    setIsRefiningFirstImpression(true);
    try {
      const response = await fetch('/api/refine-first-impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desiredFeeling: brandVoice.desiredFeeling,
          companyName: project.deckAnalysis?.elements?.companyName?.content,
          problemStatement: project.deckAnalysis?.elements?.problemStatement?.content,
          solutionDescription: project.deckAnalysis?.elements?.solutionDescription?.content,
          personalityTraits: brandVoice.personalityTraits,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setBrandVoice({ ...brandVoice, desiredFeeling: data.suggestions[0] });
        }
      }
    } catch (error) {
      console.error('Failed to refine First Impression:', error);
    } finally {
      setIsRefiningFirstImpression(false);
    }
  };

  const handleContinue = () => {
    updateProject({ brandVoice });
    nextStep();
  };

  const companyName = project.deckAnalysis?.elements?.companyName?.content || 'your company';
  const totalTraitsSelected = brandVoice.personalityTraits.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 4: Brand Voice</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Define your brand's personality and tone so all content feels consistent.
        </p>
      </div>

      {/* One-Liner */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Your One-Liner</h2>
        <p className="text-sm text-neutral-500 mb-4">
          In ONE sentence a stranger could understand, what does {companyName} do?
          <br />
          <span className="text-black">Try: "We help [who] do [what] by [how]"</span>
        </p>
        {extractedOneLiner && !project.brandVoice?.oneLiner && (
          <div className="mb-3 p-3 bg-neutral-100 border border-neutral-200 rounded-lg">
            <p className="text-sm text-neutral-600">
              <span className="font-medium">Extracted from your deck:</span> We've pre-filled this based on your pitch deck. Feel free to edit.
            </p>
          </div>
        )}
        <div className="space-y-3">
          <textarea
            value={brandVoice.oneLiner}
            onChange={(e) => setBrandVoice({ ...brandVoice, oneLiner: e.target.value })}
            placeholder="We help [target customer] achieve [outcome] by [unique approach]..."
            rows={3}
            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none resize-none"
          />
          <button
            onClick={handleRefineOneLiner}
            disabled={isRefining || !brandVoice.oneLiner.trim()}
            className="text-sm text-[#e31837] hover:text-[#c41530] disabled:text-neutral-400 transition-colors"
          >
            {isRefining ? 'Refining...' : 'Help me refine this'}
          </button>
        </div>
      </div>

      {/* Personality Traits */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Brand Personality</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Pick 3-5 words that describe your brand's personality ({totalTraitsSelected}/5 selected)
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {PERSONALITY_OPTIONS.map((trait) => (
            <button
              key={trait}
              onClick={() => toggleTrait(trait)}
              disabled={!brandVoice.personalityTraits.includes(trait) && totalTraitsSelected >= 5}
              className={`
                px-4 py-2 rounded-lg border transition-all
                ${brandVoice.personalityTraits.includes(trait)
                  ? 'border-black bg-black text-white'
                  : totalTraitsSelected >= 5
                    ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 bg-white'
                }
              `}
            >
              {trait}
            </button>
          ))}
        </div>

        {/* Custom Traits */}
        <div className="border-t border-neutral-200 pt-4 mt-4">
          <p className="text-sm text-neutral-500 mb-3">Or add your own words (up to 5 total):</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {customTraits.map((trait) => (
              <span
                key={trait}
                className="px-3 py-1.5 bg-[#e31837] text-white rounded-lg flex items-center gap-2"
              >
                {trait}
                <button
                  onClick={() => removeCustomTrait(trait)}
                  className="text-white/80 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {totalTraitsSelected < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCustomTrait}
                onChange={(e) => setNewCustomTrait(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomTrait()}
                placeholder="Type a word and press Enter"
                className="flex-1 px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none text-sm"
              />
              <button
                onClick={addCustomTrait}
                disabled={!newCustomTrait.trim()}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400 text-black rounded-lg transition-colors text-sm"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {brandVoice.personalityTraits.length > 0 && (
          <p className="mt-4 text-sm text-neutral-500">
            Selected: {brandVoice.personalityTraits.join(', ')}
          </p>
        )}
      </div>

      {/* Aesthetic Archetype */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Aesthetic Archetype</h2>
        <p className="text-sm text-neutral-500 mb-4">
          Which feels most like your company? This calibrates color, typography, and visual density downstream.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {ARCHETYPES.map((a) => (
            <button
              key={a.value}
              onClick={() => setBrandVoice({ ...brandVoice, aestheticArchetype: a.value })}
              className={`p-4 rounded-lg border text-left transition-all ${
                brandVoice.aestheticArchetype === a.value
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
              }`}
            >
              <div className={`font-medium mb-1 ${brandVoice.aestheticArchetype === a.value ? 'text-white' : 'text-black'}`}>
                {a.label}
              </div>
              <div className={`text-sm ${brandVoice.aestheticArchetype === a.value ? 'text-white/80' : 'text-neutral-500'}`}>
                {a.description}
              </div>
              {/* a.refs is intentionally NOT rendered — it's kept on the constant for downstream reference (design prompt) but hidden from the founder's UI. */}
            </button>
          ))}
        </div>
      </div>

      {/* Desired Feeling / First Impression */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">First Impression</h2>
        <p className="text-sm text-neutral-500 mb-4">
          What should a visitor feel in the first 5 seconds? One short sentence.
        </p>
        <div className="space-y-3">
          <textarea
            value={brandVoice.desiredFeeling}
            onChange={(e) => setBrandVoice({ ...brandVoice, desiredFeeling: e.target.value })}
            rows={2}
            placeholder="e.g., Credible breakthrough. Worth a closer look."
            className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none resize-none"
          />
          <button
            onClick={handleRefineFirstImpression}
            disabled={isRefiningFirstImpression || !brandVoice.desiredFeeling.trim()}
            className="text-sm text-[#e31837] hover:text-[#c41530] disabled:text-neutral-400 transition-colors"
          >
            {isRefiningFirstImpression ? 'Refining...' : 'Help me refine this'}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-neutral-500 hover:text-black transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!brandVoice.oneLiner.trim() || brandVoice.personalityTraits.length === 0}
          className="px-6 py-3 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Continue to Step 5
        </button>
      </div>
    </div>
  );
}
