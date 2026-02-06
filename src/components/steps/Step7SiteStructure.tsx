'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { SiteStructure } from '@/lib/types';

export default function Step7SiteStructure() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [structure, setStructure] = useState<SiteStructure>(
    project.siteStructure || {
      type: 'single-page',
      sections: ['Home', 'Technology/Science', 'About/Company', 'Contact'],
      navigationItems: ['Technology', 'About', 'Contact'],
      footerItems: ['Privacy Policy', 'LinkedIn', 'Email'],
      contentToCut: [],
    }
  );

  // Subsection options for each main section
  const [subsections, setSubsections] = useState<Record<string, string[]>>({
    'Technology/Science': project.siteStructure?.sections.includes('How It Works') ? ['How It Works'] : [],
    'About/Company': [
      ...(project.siteStructure?.sections.includes('Team') ? ['Team'] : []),
      ...(project.siteStructure?.sections.includes('Careers') ? ['Careers'] : []),
    ],
  });

  const mainSections = ['Home', 'Technology/Science', 'About/Company', 'Contact'];

  const subsectionOptions: Record<string, string[]> = {
    'Technology/Science': ['How It Works'],
    'About/Company': ['Team', 'Careers'],
  };

  const toggleSubsection = (parentSection: string, subsection: string) => {
    const current = subsections[parentSection] || [];
    const updated = current.includes(subsection)
      ? current.filter((s) => s !== subsection)
      : [...current, subsection];
    setSubsections({ ...subsections, [parentSection]: updated });
  };

  const handleContinue = () => {
    // Build full sections list including subsections
    const allSections = [...mainSections];
    Object.entries(subsections).forEach(([, subs]) => {
      subs.forEach((sub) => {
        if (!allSections.includes(sub)) {
          allSections.push(sub);
        }
      });
    });

    updateProject({
      siteStructure: {
        ...structure,
        sections: allSections,
      },
    });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 7: Site Structure</h1>
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

      {/* Sections Included */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Sections Included</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {mainSections.map((section) => (
            <span
              key={section}
              className="px-4 py-2 rounded-lg border border-black bg-black text-white"
            >
              {section}
            </span>
          ))}
        </div>

        {/* Subsection Options */}
        <div className="space-y-4 mt-6 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 font-medium">Optional subsections:</p>

          {/* Technology/Science subsections */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500 w-36">Technology/Science:</span>
            <div className="flex flex-wrap gap-2">
              {subsectionOptions['Technology/Science'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubsection('Technology/Science', sub)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-all ${
                    subsections['Technology/Science']?.includes(sub)
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 bg-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* About/Company subsections */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500 w-36">About/Company:</span>
            <div className="flex flex-wrap gap-2">
              {subsectionOptions['About/Company'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => toggleSubsection('About/Company', sub)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-all ${
                    subsections['About/Company']?.includes(sub)
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 bg-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
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
          Continue to Step 8
        </button>
      </div>
    </div>
  );
}
