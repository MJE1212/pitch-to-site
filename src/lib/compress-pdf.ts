'use client';

/**
 * Client-side PDF compression for the brand guide upload.
 *
 * Strategy: render each page with PDF.js to a canvas at moderate DPI, JPEG-encode
 * with tunable quality, then re-assemble into a new PDF using pdf-lib.
 *
 * This is lossy (visual fidelity drops slightly) but works for brand guides where
 * we just need Claude to read color hexes, font names, and rough layout.
 *
 * Files under THRESHOLD_BYTES are returned untouched — we only compress when needed.
 */

const THRESHOLD_BYTES = 4 * 1024 * 1024; // Don't bother compressing files <4MB

interface CompressOptions {
  /** Target DPI for rendered pages. 150 is a good balance for most brand guides. */
  dpi?: number;
  /** JPEG quality 0–1. 0.75 is a good balance between size and fidelity. */
  quality?: number;
  /** Optional progress callback for UI feedback. */
  onProgress?: (msg: string) => void;
}

export interface CompressResult {
  file: File;
  compressed: boolean;
  originalBytes: number;
  finalBytes: number;
}

export async function maybeCompressPDF(
  inputFile: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const original = inputFile.size;

  if (original < THRESHOLD_BYTES) {
    return { file: inputFile, compressed: false, originalBytes: original, finalBytes: original };
  }

  const { dpi = 150, quality = 0.75, onProgress } = options;
  onProgress?.('Loading PDF…');

  // Dynamic-import these heavy libraries so they're code-split out of the main bundle.
  const pdfjs = await import('pdfjs-dist');
  const pdfLib = await import('pdf-lib');

  // PDF.js needs an explicit worker URL. Pinning to the installed version keeps the worker
  // and core in lockstep across releases.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const version = (pdfjs as any).version || '5.7.284';
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await inputFile.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const newPdf = await pdfLib.PDFDocument.create();

  // Scale factor: PDF.js viewport is in points (72 DPI). Render at requested DPI.
  const scale = Math.min(dpi / 72, 2.5);

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Compressing page ${i} of ${pdf.numPages}…`);

    const page = await pdf.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    canvas.width = Math.floor(renderViewport.width);
    canvas.height = Math.floor(renderViewport.height);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: ctx, viewport: renderViewport, canvas } as any).promise;

    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(',')[1]), c => c.charCodeAt(0));

    const embedded = await newPdf.embedJpg(jpegBytes);
    const newPage = newPdf.addPage([baseViewport.width, baseViewport.height]);
    newPage.drawImage(embedded, {
      x: 0,
      y: 0,
      width: baseViewport.width,
      height: baseViewport.height,
    });

    // Free canvas memory between pages.
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.('Finalizing…');
  const bytes = await newPdf.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const final = blob.size;

  // If compression somehow made the file larger (rare, but possible for already-optimized PDFs),
  // fall back to the original.
  if (final >= original) {
    return { file: inputFile, compressed: false, originalBytes: original, finalBytes: original };
  }

  const newName = inputFile.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
  const compressedFile = new File([blob], newName, { type: 'application/pdf' });

  return {
    file: compressedFile,
    compressed: true,
    originalBytes: original,
    finalBytes: final,
  };
}
