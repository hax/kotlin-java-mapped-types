import * as cheerio from 'cheerio';

export interface KotlinSignature {
  signature: string;
}

export function extractKotlinSignatures(html: string): KotlinSignature[] {
  const $ = cheerio.load(html);
  const signatures: KotlinSignature[] = [];
  const seen = new Set<string>();
  
  $('code, .signature, .symbol.monospace').each((_, elem) => {
    const text = $(elem).text().trim().replace(/\s+/g, ' ');
    if ((text.includes('val ') || text.includes('var ') || text.includes('fun ')) && !seen.has(text)) {
      seen.add(text);
      signatures.push({ signature: text });
    }
  });
  
  return signatures;
}
