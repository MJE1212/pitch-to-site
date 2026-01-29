'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { CompanyStage, WebsitePurpose } from '@/lib/types';

export default function Step2WebsitePurpose() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [purpose, setPurpose] = useState<WebsitePurpose>(
    project.websitePurpose || {
      primaryAudience: ['investors', 'talent', 'partners'],
      primaryCTA: 'Contact Us',
      secondaryCTA: 'Follow us on LinkedIn',
      companyStage: 'building',
      linkedInUrl: '',
      twitterUrl: '',
    }
  );

  const stages: { value: CompanyStage; label: string; description: string }[] = [
    { value: 'idea', label: 'Idea Stage', description: 'No product yet' },
    { value: 'building', label: 'Building', description: 'Product in development' },
    { value: 'beta', label: 'Beta/Pilot', description: 'Early users testing' },
    { value: 'launched', label: 'Launched', description: 'Live product, getting traction' },
  ];

  const handleContinue = () => {
    updateProject({ websitePurpose: purpose });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 2: Website Purpose</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Define who this website is for and what you want visitors to do. This shapes everything else.
        </p>
      </div>

      {/* Tough Tech Context */}
      <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
        <p className="text-neutral-700 text-sm">
          <strong>Tough Tech Pre-seed POV:</strong> Your primary audiences are (in order): investors, talent, and early partners. The main action is "Contact Us" and secondary is social follows.
        </p>
      </div>

      {/* Company Stage */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Where is your company right now?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {stages.map((stage) => (
            <button
              key={stage.value}
              onClick={() => setPurpose({ ...purpose, companyStage: stage.value })}
              className={`
                p-4 rounded-lg border text-left transition-all
                ${purpose.companyStage === stage.value
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }
              `}
            >
              <div className={`font-medium ${purpose.companyStage === stage.value ? 'text-white' : 'text-black'}`}>{stage.label}</div>
              <div className={`text-sm ${purpose.companyStage === stage.value ? 'text-white/70' : 'text-neutral-500'}`}>{stage.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Audience */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Primary Audience</h2>
        <p className="text-sm text-neutral-500 mb-4">Who is this website for? Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {['investors', 'talent', 'partners', 'customers', 'media'].map((audience) => (
            <button
              key={audience}
              onClick={() => {
                const current = purpose.primaryAudience || [];
                const updated = current.includes(audience)
                  ? current.filter(a => a !== audience)
                  : [...current, audience];
                setPurpose({ ...purpose, primaryAudience: updated });
              }}
              className={`
                px-4 py-2 rounded-lg border capitalize transition-all
                ${(purpose.primaryAudience || []).includes(audience)
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 bg-white'
                }
              `}
            >
              {audience}
            </button>
          ))}
        </div>
      </div>

      {/* Calls to Action */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Calls to Action</h2>
        <p className="text-sm text-neutral-500 mb-4">What do you want visitors to do?</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Primary CTA (main button)
            </label>
            <input
              type="text"
              value={purpose.primaryCTA || ''}
              onChange={(e) => setPurpose({ ...purpose, primaryCTA: e.target.value })}
              placeholder="e.g., Contact Us, Get in Touch, Request Demo"
              className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Secondary CTA (secondary action)
            </label>
            <input
              type="text"
              value={purpose.secondaryCTA || ''}
              onChange={(e) => setPurpose({ ...purpose, secondaryCTA: e.target.value })}
              placeholder="e.g., Follow us on LinkedIn, Learn More, Subscribe"
              className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Social Links (Optional)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={purpose.linkedInUrl || ''}
              onChange={(e) => setPurpose({ ...purpose, linkedInUrl: e.target.value })}
              placeholder="https://linkedin.com/company/..."
              className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              X (Twitter) URL
            </label>
            <input
              type="url"
              value={purpose.twitterUrl || ''}
              onChange={(e) => setPurpose({ ...purpose, twitterUrl: e.target.value })}
              placeholder="https://x.com/..."
              className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none"
            />
          </div>
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
          className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
        >
          Continue to Step 3
        </button>
      </div>
    </div>
  );
}
