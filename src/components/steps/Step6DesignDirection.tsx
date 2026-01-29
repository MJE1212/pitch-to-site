'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { DesignDirection } from '@/lib/types';

// Simple color box using inline style with !important via style attribute
function ColorBox({ color, label }: { color: string; label: string }) {
  return (
    <div className="text-center">
      <div
        className="w-full rounded-lg border-2 border-neutral-300 shadow-md mb-3 flex items-end justify-end p-2"
        style={{
          backgroundColor: color,
          height: '96px',
          minHeight: '96px'
        }}
      >
        <span className="text-xs bg-white text-black px-2 py-1 rounded font-mono">
          {color}
        </span>
      </div>
      <p className="font-semibold text-black">{label}</p>
    </div>
  );
}

export default function Step6DesignDirection() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [design, setDesign] = useState<DesignDirection | null>(project.designDirection || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingColors, setEditingColors] = useState(false);
  const [editingTypography, setEditingTypography] = useState(false);

  const generateDesign = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckAnalysis: project.deckAnalysis,
          brandVoice: project.brandVoice,
          websitePurpose: project.websitePurpose,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate design direction');
      }

      const data = await response.json();
      setDesign(data.design);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate design');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (design) {
      updateProject({ designDirection: design });
      nextStep();
    }
  };

  const updateColor = (key: keyof DesignDirection['colorPalette'], value: string) => {
    if (!design) return;
    setDesign({
      ...design,
      colorPalette: { ...design.colorPalette, [key]: value },
    });
  };

  const updateTypography = (key: keyof DesignDirection['typography'], value: string) => {
    if (!design) return;
    setDesign({
      ...design,
      typography: { ...design.typography, [key]: value },
    });
  };

  // Check if we have deck colors to use
  const deckHasColors = project.deckAnalysis?.rawText?.toLowerCase().includes('#') ||
    project.deckAnalysis?.rawText?.toLowerCase().includes('rgb');

  if (!design && !isGenerating) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-3">Step 6: Design Direction</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Define the visual style following the "Tough Tech Website Standard" - proven for deep tech startups.
          </p>
        </div>

        {/* Info about deck extraction */}
        <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-4">
          <p className="text-neutral-700 text-sm">
            <span className="font-medium">Note:</span> We'll analyze your pitch deck for any existing brand colors and typography.
            If none are found, we'll suggest colors that match the Tough Tech aesthetic.
          </p>
        </div>

        {/* Reference Sites */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-black mb-3">Tough Tech Reference Sites</h2>
          <p className="text-sm text-neutral-500 mb-4">
            These sites embody the professional, credible aesthetic that works for science-driven startups:
          </p>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              'coperniccatalysts.com',
              'reynko.com',
              'quantumformatics.com',
              'rockzero.com',
              'robigo.bio',
              'dropletbiosci.com',
              'anthology.bio',
              'foraybio.com',
            ].map((site) => (
              <a
                key={site}
                href={`https://${site}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e31837] hover:text-[#c41530]"
              >
                {site} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-8 text-center">
          <button
            onClick={generateDesign}
            className="px-8 py-4 tough-tech-gradient text-black font-semibold rounded-lg transition-colors text-lg"
          >
            Generate Design Direction
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
        <p className="text-neutral-700">Generating design direction...</p>
        <p className="text-neutral-500 text-sm mt-2">Analyzing your pitch deck for brand elements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-3">Step 6: Design Direction</h1>
        <p className="text-neutral-600">Your visual design brief for the website</p>
      </div>

      {/* Color Palette - Light background for visibility */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-black">Color Palette</h2>
          <button
            onClick={() => setEditingColors(!editingColors)}
            className="text-sm text-[#e31837] hover:text-[#c41530] font-medium"
          >
            {editingColors ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Color swatches */}
        {design && design.colorPalette && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorBox
              color={design.colorPalette.primary || '#1e3a5f'}
              label="Primary"
            />
            <ColorBox
              color={design.colorPalette.accent || '#3b82f6'}
              label="Accent"
            />
            <ColorBox
              color={design.colorPalette.background || '#ffffff'}
              label="Background"
            />
            <ColorBox
              color={design.colorPalette.text || '#1f2937'}
              label="Text"
            />
          </div>
        )}

        {/* Edit colors */}
        {editingColors && design && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Primary</label>
              <input
                type="color"
                value={design.colorPalette?.primary || '#1e3a5f'}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="w-full h-10 cursor-pointer rounded border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Accent</label>
              <input
                type="color"
                value={design.colorPalette?.accent || '#3b82f6'}
                onChange={(e) => updateColor('accent', e.target.value)}
                className="w-full h-10 cursor-pointer rounded border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Background</label>
              <input
                type="color"
                value={design.colorPalette?.background || '#ffffff'}
                onChange={(e) => updateColor('background', e.target.value)}
                className="w-full h-10 cursor-pointer rounded border border-neutral-300"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Text</label>
              <input
                type="color"
                value={design.colorPalette?.text || '#1f2937'}
                onChange={(e) => updateColor('text', e.target.value)}
                className="w-full h-10 cursor-pointer rounded border border-neutral-300"
              />
            </div>
          </div>
        )}


        {/* Preview Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {/* Dark Preview */}
          <div
            className="p-6 rounded-lg min-h-32"
            style={{ backgroundColor: design?.colorPalette?.primary ?? '#1e3a5f' }}
          >
            <h3 className="text-lg font-bold mb-2 text-white">
              Dark Background
            </h3>
            <p className="mb-4 text-white/80 text-sm">
              White text on primary color.
            </p>
            <button
              className="px-4 py-2 rounded-lg font-medium text-white text-sm"
              style={{ backgroundColor: design?.colorPalette?.accent ?? '#3b82f6' }}
            >
              Accent Button
            </button>
          </div>

          {/* Light Preview */}
          <div
            className="p-6 rounded-lg border border-neutral-200 min-h-32"
            style={{ backgroundColor: design?.colorPalette?.background ?? '#ffffff' }}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: design?.colorPalette?.primary ?? '#1e3a5f' }}
            >
              Light Background
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: design?.colorPalette?.text ?? '#1f2937' }}
            >
              Text color on background.
            </p>
            <button
              className="px-4 py-2 rounded-lg font-medium text-white text-sm"
              style={{ backgroundColor: design?.colorPalette?.accent ?? '#3b82f6' }}
            >
              Accent Button
            </button>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Typography</h2>
          <button
            onClick={() => setEditingTypography(!editingTypography)}
            className="text-sm text-[#e31837] hover:text-[#c41530]"
          >
            {editingTypography ? 'Done' : 'Edit'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-500 mb-2">Heading Font</p>
            {editingTypography ? (
              <select
                value={design?.typography.headingFont}
                onChange={(e) => updateTypography('headingFont', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              >
                {['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Work Sans', 'DM Sans', 'Plus Jakarta Sans'].map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            ) : (
              <p className="text-black font-medium text-lg">{design?.typography.headingFont}</p>
            )}
            <p className="text-2xl font-bold text-black mt-2" style={{ fontFamily: design?.typography.headingFont }}>
              Sample Heading
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-2">Body Font</p>
            {editingTypography ? (
              <select
                value={design?.typography.bodyFont}
                onChange={(e) => updateTypography('bodyFont', e.target.value)}
                className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black"
              >
                {['Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans Pro', 'Work Sans', 'DM Sans', 'IBM Plex Sans', 'Nunito Sans', 'Karla'].map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            ) : (
              <p className="text-black font-medium text-lg">{design?.typography.bodyFont}</p>
            )}
            <p className="text-neutral-600 mt-2" style={{ fontFamily: design?.typography.bodyFont }}>
              This is sample body text showing how paragraphs will look on your website.
            </p>
          </div>
        </div>
      </div>

      {/* Imagery Style */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-3">Imagery Style</h2>
        <p className="text-neutral-600">{design?.imageryStyle}</p>
      </div>

      {/* What to Avoid */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-3">What to Avoid</h2>
        <ul className="space-y-2">
          {design?.avoidList.map((item, index) => (
            <li key={index} className="flex items-center text-neutral-600">
              <span className="text-red-500 mr-2">✕</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Reference Websites */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-3">Reference Websites</h2>
        <div className="space-y-2">
          {design?.referenceWebsites.map((site, index) => (
            <a
              key={index}
              href={site.startsWith('http') ? site : `https://${site}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[#e31837] hover:text-[#c41530]"
            >
              {site} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-3">Recommended Trust Signals</h2>
        <ul className="space-y-2">
          {design?.trustSignals.map((signal, index) => (
            <li key={index} className="flex items-center text-neutral-600">
              <span className="text-green-600 mr-2">✓</span>
              {signal}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
          Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={generateDesign}
            className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors"
          >
            Regenerate
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
          >
            Continue to Step 7
          </button>
        </div>
      </div>
    </div>
  );
}
