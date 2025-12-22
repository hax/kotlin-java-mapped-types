import { fetchText } from './fetch-text.ts';
import { kotlinDocUrl, splitQualifiedName } from './utils.ts';
import { load } from 'cheerio';

export async function extractKotlinDef(html: string) {
  const $ = load(html);
  const sourceLink = $('.symbol .source-link a').attr('href')
  if (sourceLink == null) {
    throw new Error('Source link not found in Kotlin documentation page');
  }
  const url = new URL(sourceLink);
  const startLine = parseInt(url.hash.substring(2)); // remove '#L'
  if (url.hostname !== 'github.com') {
    throw new Error(`Unexpected source link hostname: ${url.hostname}`);
  } else {
    url.hostname = 'raw.githubusercontent.com';
  }
  url.pathname = url.pathname.replace('/tree/', '/');
  if (!Number.isInteger(startLine)) {
    throw new Error(`Invalid start line in source link: ${url.hash}`);
  }
  const source = await fetchText(url.toString());
  if (source == null) {
    throw new Error(`Failed to fetch source code from ${url.toString()}`);
  }
  const lines = source.split('\n').slice(startLine - 1);
  const end = lines[0].match(/^(\s*)/)![1] + "}";
  const endLineIndex = lines.findIndex(line => line.startsWith(end));
  return lines.slice(0, endLineIndex + 1).join('\n');
}

export async function getKotlinDef(kotlinType: string) {
  const [packageName, typeName] = splitQualifiedName(kotlinType);
  const url = kotlinDocUrl(packageName, typeName);
  const html = await fetchText(url);
  if (html == null) {
    throw new Error(`Failed to fetch Kotlin documentation for ${kotlinType} from ${url}`);
  }
  const def = await extractKotlinDef(html);

  let definition = `// Source: ${url}\n\n`;

  if (packageName) {
    definition += `package ${packageName}\n\n`;
  }

  definition += def;
  return definition;
}
