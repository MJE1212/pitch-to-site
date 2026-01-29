'use client';

import { useState } from 'react';
import { ExtractedContent } from '@/lib/ai-extractor';

interface DeployOptionsProps {
  content: ExtractedContent;
  onDownload: () => void;
  isDownloading: boolean;
}

export default function DeployOptions({ content, onDownload, isDownloading }: DeployOptionsProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNetlifyDeploy = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform: 'netlify' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deploy');
      }

      setDeployedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  if (deployedUrl) {
    return (
      <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Deployed Successfully!</h3>
            <p className="text-slate-400 text-sm">Your site is now live</p>
          </div>
        </div>
        <a
          href={deployedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
        >
          Visit Your Site
        </a>
        <p className="mt-3 text-center text-slate-500 text-sm break-all">{deployedUrl}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Netlify Deploy */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.934 8.519l-8.4 8.39-3.052-3.055 8.4-8.39 3.052 3.055zm-.436-6.02l-1.8 1.795 3.052 3.055 1.8-1.795c.428-.427.428-1.12 0-1.547l-1.505-1.508c-.427-.427-1.12-.427-1.547 0zm-10.5 10.5l-1.8 1.795 3.052 3.055 1.8-1.795-3.052-3.055zm-4 4.018l2.667 2.646c.428.427 1.12.427 1.547 0l2.22-2.21-3.052-3.055-3.382 1.072z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">Deploy to Netlify</h3>
            <p className="text-slate-400 text-sm">Free hosting with instant deploy</p>
          </div>
        </div>
        <button
          onClick={handleNetlifyDeploy}
          disabled={isDeploying}
          className="w-full px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
        >
          {isDeploying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Deploying...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Deploy to Netlify
            </>
          )}
        </button>
      </div>

      {/* Download Option */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium">Download ZIP</h3>
            <p className="text-slate-400 text-sm">Get files to host anywhere</p>
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ZIP
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
