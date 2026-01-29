'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useProject } from '@/lib/ProjectContext';
import { DeckAnalysis } from '@/lib/types';

export default function Step1AnalyzeDeck() {
  const { project, updateProject, nextStep } = useProject();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-deck', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze deck');
      }

      const data = await response.json();
      updateProject({ deckAnalysis: data.analysis });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [updateProject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const analysis = project.deckAnalysis;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Present</span>;
      case 'partial':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Partial</span>;
      case 'missing':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Missing</span>;
      default:
        return null;
    }
  };

  const elementLabels: Record<string, string> = {
    companyName: 'Company/Product Name',
    tagline: 'Tagline',
    problemStatement: 'Problem Statement',
    solutionDescription: 'Solution Description',
    targetAudience: 'Target Audience',
    keyFeatures: 'Key Features/Benefits',
    howItWorks: 'How It Works',
    differentiators: 'Differentiators',
    teamInfo: 'Team Information',
    currentStatus: 'Current Status',
    contactInfo: 'Contact Information',
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-3">Step 1: Analyze Your Deck</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Upload your pitch deck and we'll identify what content you have versus what needs to be filled in.
        </p>
      </div>

      {!analysis ? (
        <>
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-[#e31837] bg-red-50' : 'border-neutral-300 hover:border-neutral-400'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-[#e31837] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-neutral-700">Analyzing your pitch deck...</p>
                <p className="text-neutral-500 text-sm mt-2">This may take a moment</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg className="w-16 h-16 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-neutral-700 mb-2">
                  <span className="text-[#e31837] font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-neutral-500 text-sm">PDF files only (max 10MB)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Analysis Results */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-black">Deck Analysis Results</h2>
              <p className="text-sm text-neutral-500">Review what we found in your pitch deck</p>
            </div>

            <div className="divide-y divide-neutral-200">
              {Object.entries(analysis.elements).map(([key, element]) => (
                <div key={key} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-black">{elementLabels[key] || key}</span>
                    {getStatusBadge(element.status)}
                  </div>
                  {element.content && (
                    <p className="text-sm text-neutral-600 bg-white p-3 rounded-lg border border-neutral-200">
                      "{element.content}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
            <p className="text-neutral-700 text-sm">
              {(() => {
                const elements = Object.values(analysis.elements);
                const present = elements.filter(e => e.status === 'present').length;
                const partial = elements.filter(e => e.status === 'partial').length;
                const missing = elements.filter(e => e.status === 'missing').length;
                return `Found ${present} complete elements, ${partial} partial, and ${missing} missing. We'll help you fill the gaps in the next steps.`;
              })()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => updateProject({ deckAnalysis: undefined })}
              className="px-6 py-3 text-neutral-500 hover:text-black transition-colors"
            >
              Upload Different File
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
            >
              Continue to Step 2
            </button>
          </div>
        </>
      )}
    </div>
  );
}
