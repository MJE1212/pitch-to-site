import { NextRequest, NextResponse } from 'next/server';
import { generateHTML, generateCSS, generateJS } from '@/lib/site-generator';
import { ExtractedContent } from '@/lib/ai-extractor';

export async function POST(request: NextRequest) {
  try {
    const { content, preview } = await request.json() as {
      content: ExtractedContent;
      preview?: boolean
    };

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    const html = generateHTML(content);
    const css = generateCSS();
    const js = generateJS();

    if (preview) {
      // For preview, return inline HTML with embedded CSS and JS
      const inlineHtml = html
        .replace('<link rel="stylesheet" href="styles.css">', `<style>${css}</style>`)
        .replace('<script src="script.js"></script>', `<script>${js}</script>`);

      return NextResponse.json({ html: inlineHtml });
    }

    return NextResponse.json({
      files: {
        'index.html': html,
        'styles.css': css,
        'script.js': js,
      },
    });
  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    );
  }
}
