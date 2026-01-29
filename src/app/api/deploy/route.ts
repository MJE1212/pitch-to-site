import { NextRequest, NextResponse } from 'next/server';
import { generateHTML, generateCSS, generateJS } from '@/lib/site-generator';
import { ExtractedContent } from '@/lib/ai-extractor';
import archiver from 'archiver';

export async function POST(request: NextRequest) {
  try {
    const { content, platform } = await request.json() as {
      content: ExtractedContent;
      platform: 'netlify';
    };

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    if (platform !== 'netlify') {
      return NextResponse.json(
        { error: 'Only Netlify deployment is supported' },
        { status: 400 }
      );
    }

    // Generate files
    const html = generateHTML(content);
    const css = generateCSS();
    const js = generateJS();

    // Create ZIP archive for Netlify
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve());
      archive.on('error', (err: Error) => reject(err));

      archive.append(html, { name: 'index.html' });
      archive.append(css, { name: 'styles.css' });
      archive.append(js, { name: 'script.js' });

      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);

    // Deploy to Netlify using their API
    // Netlify allows anonymous deploys without authentication
    const deployResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/zip',
      },
      body: zipBuffer,
    });

    if (!deployResponse.ok) {
      const errorData = await deployResponse.text();
      console.error('Netlify deploy error:', errorData);
      throw new Error('Failed to deploy to Netlify');
    }

    const deployData = await deployResponse.json() as {
      id: string;
      url: string;
      ssl_url: string;
      admin_url: string;
    };

    return NextResponse.json({
      success: true,
      url: deployData.ssl_url || deployData.url,
      adminUrl: deployData.admin_url,
      siteId: deployData.id,
    });
  } catch (error) {
    console.error('Deploy API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to deploy' },
      { status: 500 }
    );
  }
}
