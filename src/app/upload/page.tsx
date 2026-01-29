'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';

export default function UploadPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileAccepted = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process file');
      }

      const data = await response.json();

      // Store extracted content in sessionStorage for the edit page
      sessionStorage.setItem('extractedContent', JSON.stringify(data.content));

      router.push('/edit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
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

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">
            Upload Your Pitch Deck
          </h1>
          <p className="text-slate-400">
            We'll extract the key information and help you create a landing page.
          </p>
        </div>

        {/* Upload area */}
        <FileUpload onFileAccepted={handleFileAccepted} isProcessing={isProcessing} />

        {/* Error display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-10 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-medium mb-3">Tips for best results</h3>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Include your company name and tagline clearly
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Describe the problem you're solving
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              List your key features or benefits
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Have contact information or a call-to-action
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
