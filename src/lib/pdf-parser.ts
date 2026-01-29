import { extractText } from 'unpdf';

export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);
    // text can be a string or array of strings (one per page)
    const text = Array.isArray(result.text) ? result.text.join('\n') : result.text;
    return text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF. Please ensure the file is a valid PDF.');
  }
}
