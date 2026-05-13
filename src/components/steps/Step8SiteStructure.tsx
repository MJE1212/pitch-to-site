'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { SiteStructure } from '@/lib/types';

export default function Step8SiteStructure() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  // Canonical Tough Tech scroll-section order (non-negotiable for pre-seed).
  // The actual blueprint at Step 11 renders in this order regardless of edits below;
  // this list documents that to the founder and feeds the spec doc.
  const CANONICAL_SECTIONS = [
    'Hero',
    'Problem',
    'Breakthrough',
    'Outcomes',
    'How It Works',
    'Team',
    'Confidence Signals',
    'Final CTA',
  ];

  const [structure, setStructure] = useState<SiteStructure>(
    project.siteStructure || {
      type: 'single-page',
      sections: CANONICAL_SECTIONS,
      navigationItems: ['Technology', 'Team', 'Contact'],
      footerItems: ['Privacy Policy', 'LinkedIn', 'Email'],
      contentToCut: [],
    }
  );

  // Optional sections the founder can drop if they have no content to put there.
  // We also accept the legacy 'Trust' value when restoring state from older sessions
  // that were saved before the rename to 'Confidence Signals'.
  const [includeTeam, setIncludeTeam] = useState<boolean>(
    project.siteStructure ? project.siteStructure.sections.includes('Team') : true
  );
  const [includeTrust, setIncludeTrust] = useState<boolean>(
    project.siteStructure
      ? project.siteStructure.sections.includes('Confidence Signals') ||
          project.siteStructure.sections.includes('Trust')
      : true
  );

  const handleContinue = () => {
    // Filter out optional sections the founder dropped.
    const sections = CANONICAL_SECTIONS.filter((s) => {
      if (s === 'Team' && !includeTeam) return false;
      if (s === 'Confidence Signals' && !includeTrust) return false;
      return true;
    });

    updateProject({
      siteStructure: {
        ...structure,
        sections,
      },
    });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 8: Site Structure</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Define the structure and navigation for your website.
        </p>
      </div>

      {/* Site Type */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Site Type</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setStructure({ ...structure, type: 'single-page' })}
            className={`p-4 rounded-lg border text-left transition-all ${
              structure.type === 'single-page'
                ? 'border-black bg-black text-white'
                : 'border-neutral-200 hover:border-neutral-400 bg-white'
            }`}
          >
            <div className={`font-medium ${structure.type === 'single-page' ? 'text-white' : 'text-black'}`}>Single Page</div>
            <div className={`text-sm ${structure.type === 'single-page' ? 'text-white/70' : 'text-neutral-500'}`}>
              All content on one scrollable page. Recommended for early-stage startups.
            </div>
          </button>
          <button
            onClick={() => setStructure({ ...structure, type: 'multi-page' })}
            className={`p-4 rounded-lg border text-left transition-all ${
              structure.type === 'multi-page'
                ? 'border-black bg-black text-white'
                : 'border-neutral-200 hover:border-neutral-400 bg-white'
            }`}
          >
            <div className={`font-medium ${structure.type === 'multi-page' ? 'text-white' : 'text-black'}`}>Multi-Page</div>
            <div className={`text-sm ${structure.type === 'multi-page' ? 'text-white/70' : 'text-neutral-500'}`}>
              Separate pages for different content. Better for more established companies.
            </div>
          </button>
        </div>
      </div>

      {/* Canonical Scroll Sections (locked) */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Scroll Sections (Tough Tech standard)</h2>
        <p className="text-sm text-neutral-500 mb-4">
          The order below is locked. Pre-seed Tough Tech sites win on this exact narrative arc — Hero → Problem → Breakthrough → Outcomes → Team → Confidence Signals → CTA. You can drop Team and Confidence Signals if you don't yet have content to fill them.
        </p>
        <ol className="space-y-2 mb-6">
          {CANONICAL_SECTIONS.map((section) => {
            const optional = section === 'Team' || section === 'Confidence Signals';
            const dropped =
              (section === 'Team' && !includeTeam) ||
              (section === 'Confidence Signals' && !includeTrust);
            return (
              <li
                key={section}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                  dropped ? 'border-neutral-200 bg-white/50 opacity-50' : 'border-black bg-white'
                }`}
              >
                <span className="flex items-start gap-3">
                  <span className="flex flex-col">
                    <span className="flex items-center gap-2">
                      <span className={`font-medium ${dropped ? 'line-through text-neutral-400' : 'text-black'}`}>
                        {section}
                      </span>
                      {optional && (
                        <span className="text-xs text-neutral-500">(optional)</span>
                      )}
                    </span>
                    {optional && (
                      <span className="text-xs text-neutral-500 mt-0.5">
                        {section === 'Team'
                          ? 'Guideline: include if 2+ co-founders and/or advisors are available'
                          : 'Guideline: include if 3+ investor/funder logos are available'}
                      </span>
                    )}
                  </span>
                </span>
                {optional && (
                  <label className="flex items-center gap-2 text-sm text-neutral-600 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={section === 'Team' ? includeTeam : includeTrust}
                      onChange={(e) => {
                        if (section === 'Team') setIncludeTeam(e.target.checked);
                        else setIncludeTrust(e.target.checked);
                      }}
                    />
                    Include
                  </label>
                )}
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-neutral-400">
          Note: "Hero", "Problem", "Breakthrough", "Outcomes", "How It Works", and "Final CTA" are required for any Tough Tech homepage and cannot be removed.
        </p>
      </div>

      {/* Footer */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Footer Items</h2>
        <p className="text-sm text-neutral-500 mb-4">Links and info for the footer.</p>
        <input
          type="text"
          value={structure.footerItems.join(', ')}
          onChange={(e) =>
            setStructure({
              ...structure,
              footerItems: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="Privacy Policy, LinkedIn, Contact"
          className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none"
        />
      </div>

      {/* Tip */}
      <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
        <p className="text-neutral-700 text-sm">
          <strong>Tip:</strong> Simpler is almost always better for early-stage startups. You can always add pages later. A focused, clear single-page site is often sufficient.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
          Back
        </button>
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
        >
          Continue to Step 9
        </button>
      </div>
    </div>
  );
}
