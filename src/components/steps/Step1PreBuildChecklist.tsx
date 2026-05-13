'use client';

import { useState } from 'react';
import { useProject } from '@/lib/ProjectContext';

// The checklist is advisory: nothing here gates progression.
// Pitch Deck and Logo are emphasized because the build literally cannot finish without them.
// We split items into two boxes so it's clear which materials feed THIS app vs. which the
// founder will hand directly to their AI website builder later.
interface ChecklistItem {
  id: string;
  // Plain-text label for items without inline links/emphasis. If `render` is provided, it overrides this.
  label?: string;
  bold?: boolean;
  // For complex items with links or inline emphasis we render JSX directly.
  render?: () => React.ReactNode;
}

// Box 1 — materials this Wireframer app actually consumes.
const WIREFRAMER_ITEMS: ChecklistItem[] = [
  { id: 'deck', label: 'Pitch Deck (required)', bold: true },
  { id: 'brand-guide', label: 'Brand Guide' },
  { id: 'reference-sites-like', label: 'Websites you like (up to 3)' },
  { id: 'reference-sites-dislike', label: "Websites you don't like (up to 3)" },
];

// Box 2 — materials the founder hands directly to Lovable / Bolt / Figma Make /
// another AI builder during the build phase. Logo leads since it's the only other
// strictly required item.
const AI_BUILDER_ITEMS: ChecklistItem[] = [
  { id: 'logo', label: 'Logo (PNG, JPG, or SVG)', bold: true },
  { id: 'investor-logos', label: 'Investor and funder logos' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'photos', label: 'Photos of your technology, lab/site and/or other relevant items' },
  {
    id: 'high-quality-photography',
    render: () => (
      <>
        High-quality photography (for hero image and other non-product/technology sections); we recommend Unsplash
        for royalty-free visuals:{' '}
        <a
          href="https://unsplash.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e31837] underline hover:text-[#c41530]"
          onClick={(e) => e.stopPropagation()}
        >
          https://unsplash.com/
        </a>{' '}
        → avoid AI-generated visuals!
      </>
    ),
  },
  {
    id: 'abstract-visuals',
    label:
      'Abstract scientific renders or other professional-looking visuals directly relevant to your technology',
  },
  {
    id: 'ai-builder-account',
    render: () => (
      <>
        (if you are planning to generate the website yourself) Lovable, Bolt, Figma Make, or other AI builder —{' '}
        <span className="font-semibold">plan for a paid tier (~$20/mo)</span> since free credits run out fast when iterating
      </>
    ),
  },
];

export default function Step1PreBuildChecklist() {
  const { project, updateProject, nextStep } = useProject();

  const [checkedIds, setCheckedIds] = useState<string[]>(
    project.preBuildChecklist?.checkedIds || []
  );

  const toggle = (id: string) => {
    const next = checkedIds.includes(id)
      ? checkedIds.filter((x) => x !== id)
      : [...checkedIds, id];
    setCheckedIds(next);
    updateProject({ preBuildChecklist: { checkedIds: next } });
  };

  const handleContinue = () => {
    updateProject({ preBuildChecklist: { checkedIds } });
    nextStep();
  };

  // Single source of truth for how a checklist row renders, so both boxes look identical.
  const renderItem = (item: ChecklistItem) => {
    const checked = checkedIds.includes(item.id);
    return (
      <li key={item.id}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggle(item.id)}
            className="mt-1 w-4 h-4 rounded border-neutral-300 cursor-pointer flex-shrink-0"
          />
          <span
            className={`text-neutral-700 ${item.bold ? 'font-semibold text-black' : ''} ${
              checked ? 'line-through text-neutral-400' : ''
            }`}
          >
            {item.render ? item.render() : item.label}
          </span>
        </label>
      </li>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 1: Pre-build Checklist</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Gather your build materials before starting.
        </p>
      </div>

      <div className="space-y-6">
        {/* Box 1 — Materials this Wireframer consumes directly */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-black mb-4">For this Wireframer</h2>
          <ul className="space-y-3">
            {WIREFRAMER_ITEMS.map(renderItem)}
          </ul>
        </div>

        {/* Box 2 — Materials uploaded directly to the AI builder during the build phase */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-black mb-4">For Lovable or another AI Website Builder Tool</h2>
          <ul className="space-y-3">
            {AI_BUILDER_ITEMS.map(renderItem)}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
        >
          Continue to Step 2
        </button>
      </div>
    </div>
  );
}
