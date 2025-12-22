import { fetchText } from './fetch-text.ts';
import { splitQualifiedName, androidDocUrl } from './utils.ts';
import { load } from 'cheerio';

interface JavaDef {
  type: string
  super: string[]
  members: string[]
}

export function extractJavaDef(html: string): JavaDef {
  const $ = load(html);
  let name = '';
  const superTypes: string[] = [];
  const members: string[] = [];
  $('.api-signature').each((_, elem) => { 
    const s = $(elem).text().replace(/\s+/g, ' ').trim();
    if (s == "") return;
    if (/ (class|interface) /.test(s)) name = s
    else if (s.startsWith('extends ') || s.startsWith('implements ')) superTypes.push(s);
    else members.push(s);
  });
  return { type: name, super: superTypes, members };
}

export async function getJavaDef(javaType: string) {
  const [packageName, typeName] = splitQualifiedName(javaType);
  const url = androidDocUrl(packageName, typeName);
  console.log(`Fetching Java definition for ${javaType}...\n`);
  const html = await fetchText(url);
  if (html == null) {
    throw new Error(`Failed to fetch Java documentation for ${javaType}`);
  }
  const def = extractJavaDef(html);
  // console.log(def)

  return `// Source: ${url}

package ${packageName};

${def.type}${def.super.map(s => ' ' + s).join('')} {
${def.members.map(s => `\t${s};`).join('\n')}
}
`;
}
