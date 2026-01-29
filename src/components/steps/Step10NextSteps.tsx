'use client';

import { useProject } from '@/lib/ProjectContext';

export default function Step10NextSteps() {
  const { project, prevStep, resetProject } = useProject();

  const handleDownloadSpec = () => {
    if (project.specDocument?.markdown) {
      const blob = new Blob([project.specDocument.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website-spec.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPrompt = () => {
    if (project.aiBuilderPrompt?.prompt) {
      const blob = new Blob([project.aiBuilderPrompt.prompt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-builder-prompt.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyPrompt = () => {
    if (project.aiBuilderPrompt?.prompt) {
      navigator.clipboard.writeText(project.aiBuilderPrompt.prompt);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-black mb-3">You're All Set!</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          You now have everything you need to build your website. Here's what to do next.
        </p>
      </div>

      {/* Your Deliverables */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Your Deliverables</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-neutral-200">
            <h3 className="font-medium text-black mb-2">Spec Document</h3>
            <p className="text-sm text-neutral-500 mb-3">
              Complete website specification with all content, design direction, and structure.
            </p>
            <button
              onClick={handleDownloadSpec}
              disabled={!project.specDocument?.markdown}
              className="w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-black rounded-lg transition-colors"
            >
              Download .md
            </button>
          </div>
          <div className="p-4 bg-white rounded-lg border border-neutral-200">
            <h3 className="font-medium text-black mb-2">AI Builder Prompt</h3>
            <p className="text-sm text-neutral-500 mb-3">
              Ready-to-paste prompt for Bolt.new, Lovable, or other AI builders.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPrompt}
                disabled={!project.aiBuilderPrompt?.prompt}
                className="flex-1 px-4 py-2 tough-tech-gradient disabled:opacity-50 text-black rounded-lg transition-colors"
              >
                Copy
              </button>
              <button
                onClick={handleDownloadPrompt}
                disabled={!project.aiBuilderPrompt?.prompt}
                className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-black rounded-lg transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Option A: AI Builder */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Option A: Use an AI Website Builder</h2>
        <p className="text-neutral-500 text-sm mb-4">
          Fastest way to get a working site. Paste your prompt and iterate.
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#e31837] transition-colors text-center"
          >
            <div className="font-medium text-black">Bolt.new</div>
            <div className="text-xs text-neutral-500">Full-stack apps</div>
          </a>
          <a
            href="https://lovable.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#e31837] transition-colors text-center"
          >
            <div className="font-medium text-black">Lovable</div>
            <div className="text-xs text-neutral-500">Beautiful sites</div>
          </a>
          <a
            href="https://www.figma.com/make"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-[#e31837] transition-colors text-center"
          >
            <div className="font-medium text-black">Figma Make</div>
            <div className="text-xs text-neutral-500">Design to code</div>
          </a>
        </div>
      </div>

      {/* Option B: Developer */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Option B: Hand Off to a Developer</h2>
        <p className="text-neutral-500 text-sm mb-4">
          Share your spec document. They'll have all the content, structure, and design direction needed.
        </p>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> All content ready to use
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Design direction with colors & fonts
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-600">✓</span> Site structure defined
          </li>
        </ul>
      </div>

      {/* Option C: DIY */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-2">Option C: Build It Yourself</h2>
        <p className="text-neutral-500 text-sm mb-4">
          Use a no-code builder like Webflow, Framer, or Carrd with your spec as a guide.
        </p>
      </div>

      {/* Pre-Launch Checklist */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Before You Launch: Checklist</h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm">
          {[
            'Replace any placeholder text with real content',
            'Add your real logo and images',
            'Connect your form to an email tool (Mailchimp, ConvertKit, etc.)',
            'Add analytics (Google Analytics or similar)',
            'Test on mobile devices',
            'Add privacy policy and terms (use a generator if needed)',
            'Connect your custom domain and social (LinkedIn, X)',
            'Have a friend review before going live including all links and forms',
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-2 text-neutral-600 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 bg-white" />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="px-6 py-3 text-neutral-500 hover:text-black transition-colors">
          Back
        </button>
        <button
          onClick={resetProject}
          className="px-6 py-3 border border-neutral-300 text-neutral-600 hover:border-neutral-400 rounded-lg transition-colors"
        >
          Start New Project
        </button>
      </div>
    </div>
  );
}
