import { NextRequest, NextResponse } from 'next/server';
import { generateHTML, generateCSS, generateJS } from '@/lib/site-generator';
import { ExtractedContent } from '@/lib/ai-extractor';
import archiver from 'archiver';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json() as { content: ExtractedContent };

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Generate files
    const html = generateHTML(content);
    const css = generateCSS();
    const js = generateJS();

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Collect chunks
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve());
      archive.on('error', (err: Error) => reject(err));

      // Add files to archive
      archive.append(html, { name: 'index.html' });
      archive.append(css, { name: 'styles.css' });
      archive.append(js, { name: 'script.js' });

      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${content.companyName.toLowerCase().replace(/\s+/g, '-')}-website.zip"`,
      },
    });
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    );
  }
}
