'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ContentEditor from '@/components/ContentEditor';
import { ExtractedContent } from '@/lib/ai-extractor';

export default function EditPage() {
  const router = useRouter();
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('extractedContent');
    if (stored) {
      setContent(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const handleContinue = () => {
    if (content) {
      sessionStorage.setItem('extractedContent', JSON.stringify(content));
      router.push('/preview');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Content Found</h1>
          <p className="text-slate-400 mb-8">
            Please upload a pitch deck first to extract content.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/upload"
              className="inline-flex items-center text-slate-400 hover:text-white mb-2 transition-colors text-sm"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Edit Your Content</h1>
          </div>
          <div className="text-sm text-slate-400">
            Step 2 of 3
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            We've extracted content from your pitch deck. Review and edit as needed before generating your website.
          </p>
        </div>

        {/* Editor */}
        <ContentEditor content={content} onChange={setContent} />

        {/* Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Preview & Generate
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
          </button>
        </div>
      </div>
    </div>
  );
}
