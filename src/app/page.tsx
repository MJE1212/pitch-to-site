'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - The Engine style */}
      <header className="bg-black px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-tight">
              <span className="text-sm text-white tracking-[0.25em]" style={{ fontWeight: 900, fontFamily: 'Arial Black, Helvetica, sans-serif' }}>THE</span>
              <span className="text-sm text-white tracking-[0.25em]" style={{ fontWeight: 900, fontFamily: 'Arial Black, Helvetica, sans-serif' }}>ENGINE</span>
            </div>
            <span className="text-white/40 text-sm mx-1">|</span>
            <span className="text-white/70 text-sm">
              Website Builder
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-black mb-4 tracking-tight">
            Pitch Deck to Website Builder
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Transform your pitch deck into a professional Tough Tech website in 10 guided steps.
            Upload your PDF, refine your messaging, and get everything you need to build your new website.
          </p>
        </header>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-black text-center mb-10">
            The 10-Step Process
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { num: 1, title: 'Upload & Analyze', desc: 'Extract key information from your pitch deck' },
              { num: 2, title: 'Define Purpose', desc: 'Set your website goals and target audience' },
              { num: 3, title: 'Brand Voice', desc: 'Nail your one-liner and personality' },
              { num: 4, title: 'Fill Gaps', desc: 'Answer questions to complete your story' },
              { num: 5, title: 'Homepage Content', desc: 'Generate compelling copy for every section' },
              { num: 6, title: 'Design Direction', desc: 'Define colors, fonts, and visual style' },
              { num: 7, title: 'Site Structure', desc: 'Plan your navigation and sections' },
              { num: 8, title: 'Spec Document', desc: 'Get a complete website specification' },
              { num: 9, title: 'AI Prompt', desc: 'Ready-to-use prompt for AI builders' },
              { num: 10, title: 'Next Steps', desc: 'Export everything and choose your path' },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-black font-medium">{step.title}</h3>
                  <p className="text-neutral-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-black font-medium mb-1">Tough Tech Standard</h3>
              <p className="text-neutral-500 text-sm">Follows best practices for deep tech startup websites</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-black font-medium mb-1">AI-Powered</h3>
              <p className="text-neutral-500 text-sm">Uses Claude to extract and refine your content</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-black font-medium mb-1">Export Ready</h3>
              <p className="text-neutral-500 text-sm">Get specs, prompts, and assets for any builder</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/wizard"
            className="inline-flex items-center px-8 py-4 tough-tech-gradient text-black font-semibold rounded-lg transition-colors text-lg"
          >
            Start Building
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-neutral-400 text-sm">
          <p>No account required. Your data stays in your browser.</p>
        </footer>
      </div>
    </div>
  );
}
