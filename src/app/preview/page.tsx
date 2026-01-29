'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ExtractedContent } from '@/lib/ai-extractor';
import DeployOptions from '@/components/DeployOptions';

export default function PreviewPage() {
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('extractedContent');
    if (stored) {
      const parsedContent = JSON.parse(stored);
      setContent(parsedContent);
      generatePreview(parsedContent);
    }
    setIsLoading(false);
  }, []);

  const generatePreview = async (contentData: ExtractedContent) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentData, preview: true }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewHtml(data.html);
      }
    } catch (error) {
      console.error('Preview generation error:', error);
    }
  };

  const handleDownload = async () => {
    if (!content) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${content.companyName.toLowerCase().replace(/\s+/g, '-')}-website.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (previewHtml && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);

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
            Please upload a pitch deck first to generate a website.
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
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/edit"
              className="inline-flex items-center text-slate-400 hover:text-white transition-colors text-sm"
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
              Back to Edit
            </Link>
            <span className="text-slate-600">|</span>
            <h1 className="text-lg font-semibold text-white">Preview & Deploy</h1>
          </div>
          <span className="text-sm text-slate-400">Step 3 of 3</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview Frame */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="bg-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-sm text-slate-500 text-center">
                    {content.companyName.toLowerCase().replace(/\s+/g, '-')}.com
                  </div>
                </div>
              </div>
              {/* Iframe */}
              <iframe
                ref={iframeRef}
                className="w-full h-[600px] border-0"
                title="Website Preview"
              />
            </div>
          </div>

          {/* Deploy Options Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4">Deploy Your Site</h2>
            <DeployOptions
              content={content}
              onDownload={handleDownload}
              isDownloading={isGenerating}
            />

            {/* What's included */}
            <div className="mt-6 bg-slate-800/50 rounded-xl p-5 border border-slate-700">
              <h3 className="text-white font-medium mb-3 text-sm">Included in your site:</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Responsive landing page
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mobile navigation
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Smooth scroll
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SEO-ready HTML
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
