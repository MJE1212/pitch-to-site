'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  isProcessing?: boolean;
}

export default function FileUpload({ onFileAccepted, isProcessing = false }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        setError('Please upload a valid PDF file.');
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be under 10MB.');
          return;
        }
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-300">Processing your pitch deck...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-blue-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-blue-400 font-medium">Drop your PDF here</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-slate-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-300 mb-2">
              <span className="text-blue-400 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-slate-500 text-sm">PDF files only (max 10MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
