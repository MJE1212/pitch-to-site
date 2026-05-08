'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';
import { WebsitePurpose } from '@/lib/types';

export default function Step3WebsitePurpose() {
  const { project, updateProject, nextStep, prevStep } = useProject();

  const [purpose, setPurpose] = useState<WebsitePurpose>(
    project.websitePurpose || {
      primaryAudience: ['investors', 'talent', 'partners'],
      primaryCTA: 'Contact Us',
      secondaryCTA: 'Follow us on LinkedIn',
      companyStage: 'building',
      linkedInUrl: '',
      twitterUrl: '',
      firstTenSecondsBelief: '',
    }
  );

  const handleContinue = () => {
    updateProject({ websitePurpose: purpose });
    nextStep();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 3: Website Purpose</h1>
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

      {/* Primary Audience — locked for The Engine cohort.
          Picker removed: pre-seed Tough Tech sites are always built for investors → talent → partners.
          See docs/tough-tech-patterns.md for rationale. */}

      {/* First-10-Seconds Belief */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">First-10-Seconds Belief</h2>
        <p className="text-sm text-neutral-500 mb-4">
          What is the ONE thing an investor must believe within 10 seconds of landing on your site? This becomes the load-bearing claim that anchors your hero copy.
        </p>
        <div className="mb-3 p-3 bg-neutral-100 border border-neutral-200 rounded-lg">
          <p className="text-xs text-neutral-600">
            <span className="font-medium">Example:</span> "This team has cracked the yield problem that's blocked industrial biotech for 20 years."
            <br />
            <span className="font-medium">Bad example:</span> "We are building the future of biotech." (too vague — could fit any company)
          </p>
        </div>
        <textarea
          value={purpose.firstTenSecondsBelief || ''}
          onChange={(e) => setPurpose({ ...purpose, firstTenSecondsBelief: e.target.value })}
          placeholder="This team has [achieved / unlocked / cracked] [specific hard thing] that [incumbent / status quo] couldn't…"
          rows={3}
          className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-lg text-black focus:border-black focus:ring-1 focus:ring-black outline-none resize-none"
        />
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
          Continue to Step 4
        </button>
      </div>
    </div>
  );
}
