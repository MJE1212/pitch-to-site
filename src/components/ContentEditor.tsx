'use client';

import { ExtractedContent } from '@/lib/ai-extractor';

interface ContentEditorProps {
  content: ExtractedContent;
  onChange: (content: ExtractedContent) => void;
}

export default function ContentEditor({ content, onChange }: ContentEditorProps) {
  const updateField = (field: keyof ExtractedContent, value: string) => {
    onChange({ ...content, [field]: value });
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...content.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...content, features: newFeatures });
  };

  const addFeature = () => {
    onChange({
      ...content,
      features: [
        ...content.features,
        { title: 'New Feature', description: 'Add a description' },
      ],
    });
  };

  const removeFeature = (index: number) => {
    if (content.features.length <= 1) return;
    const newFeatures = content.features.filter((_, i) => i !== index);
    onChange({ ...content, features: newFeatures });
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={content.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={content.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Problem & Solution</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              The Problem
            </label>
            <textarea
              value={content.problem}
              onChange={(e) => updateField('problem', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Your Solution
            </label>
            <textarea
              value={content.solution}
              onChange={(e) => updateField('solution', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Features</h3>
          <button
            onClick={addFeature}
            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            + Add Feature
          </button>
        </div>
        <div className="space-y-4">
          {content.features.map((feature, index) => (
            <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Feature {index + 1}
                </span>
                {content.features.length > 1 && (
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={feature.title}
                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                placeholder="Feature title"
                className="w-full px-3 py-2 mb-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <textarea
                value={feature.description}
                onChange={(e) => updateFeature(index, 'description', e.target.value)}
                placeholder="Feature description"
                rows={2}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action & Contact */}
      <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Call to Action & Contact</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              CTA Button Text
            </label>
            <input
              type="text"
              value={content.cta}
              onChange={(e) => updateField('cta', e.target.value)}
              placeholder="e.g., Get Started, Book a Demo"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={content.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder="hello@example.com"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={content.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
