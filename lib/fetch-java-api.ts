import * as cheerio from 'cheerio';

export interface JavaSignature {
  signature: string;
  hasOverride: boolean;
}

export function extractJavaSignatures(html: string): JavaSignature[] {
  const $ = cheerio.load(html);
  const signatures: JavaSignature[] = [];
  
  $('.api-signature, code.api-signature, pre.api-signature').each((_, elem) => {
    const sig = $(elem).text().trim().replace(/\s+/g, ' ');
    if (sig && sig.includes('(')) {
      const parent = $(elem).parent();
      const hasOverride = parent.text().includes('@Override');
      signatures.push({ signature: sig, hasOverride });
    }
  });
  
  return signatures;
}
