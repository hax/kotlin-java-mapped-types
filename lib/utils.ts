import * as fs from 'fs/promises';

export interface TypeInfo {
  kind: string;
  name: string;
}

export function extractPackageName(lines: string[]): string {
  for (const line of lines) {
    const trimmed = line.trim();
    const pkgMatch = trimmed.match(/^package\s+([\w.]+)/);
    if (pkgMatch) {
      return pkgMatch[1];
    }
  }
  return '';
}

export function extractTypeDeclaration(lines: string[]): { kind: string; typeName: string } | null {
  for (const line of lines) {
    const trimmed = line.trim();
    const javaMatch = trimmed.match(/(?:public\s+)?(?:final\s+)?(class|interface)\s+(\w+)/);
    if (javaMatch) {
      return { kind: javaMatch[1], typeName: javaMatch[2] };
    }
    const kotlinMatch = trimmed.match(/^(?:open\s+)?(class|interface)\s+(\w+)/);
    if (kotlinMatch) {
      return { kind: kotlinMatch[1], typeName: kotlinMatch[2] };
    }
  }
  return null;
}

export async function extractTypeInfo(defFile: string): Promise<TypeInfo | null> {
  try {
    const content = await fs.readFile(defFile, 'utf-8');
    const lines = content.split('\n');
    const packageName = extractPackageName(lines);
    const declaration = extractTypeDeclaration(lines);

    if (!declaration) {
      return null;
    }

    const qualifiedName = packageName ? `${packageName}.${declaration.typeName}` : declaration.typeName;
    return { kind: declaration.kind, name: qualifiedName };
  } catch (error) {
    return null;
  }
}

export function splitQualifiedName(qualifiedName: string): [packageName: string, typeName: string] {
  const parts = qualifiedName.split('.');
  let packageEndIndex = parts.findIndex(part => /^[A-Z]/.test(part));
  // If no uppercase part found, assume the last part is the type name
  // Because -1 (not found) is same as parts.length - 1 for slice, no need to adjust
  // if (packageEndIndex === -1) {
  //   packageEndIndex = parts.length - 1;
  // }
  const packageName = parts.slice(0, packageEndIndex).join('.');
  const typeName = parts.slice(packageEndIndex).join('.');
  return [packageName, typeName];
}

export function kotlinDocUrl(packageName: string, typeName: string): string {
  const kebabNames = typeName.split('.')
    .map(name => name.replaceAll(/[A-Z]/g, m => '-' + m.toLowerCase()))
    .join('/');
  return `https://kotlinlang.org/api/core/kotlin-stdlib/${packageName}/${kebabNames}/`;
}

export function androidDocUrl(packageName: string, typeName: string): string {
  const packagePath = packageName.replaceAll('.', '/');
  return `https://developer.android.com/reference/${packagePath}/${typeName}`;
}

export function qualifyJavaType(type: string): string {
  if (type.startsWith('java.')) {
    return type;
  }
  if (type.endsWith('[]')) {
    return qualifyJavaType(type.slice(0, -2)) + '[]';
  }
  if (isPrimitiveJavaType(type)) {
    return type;
  }
  if (/^(Iterable|String)\b/.test(type)) {
    return `java.lang.${type}`;
  }
  if (/^(Iterator|Collection|Set|List|ListIterator|Map)\b/.test(type)) {
    return `java.util.${type}`;
  }
  throw new Error(`Unknown Java type: ${type}`);
}

export function isPrimitiveJavaType(type: string) {
  return ['byte', 'short', 'int', 'long', 'char', 'float', 'double', 'boolean', 'void'].includes(type);
}
      
export function qualifyKotlinType(type: string) {
  if (type.startsWith('kotlin.')) {
    return type;
  }
  if (/^(Mutable)?(Iterator|Iterable|Collection|Set|List|ListIterator|Map)\b/.test(type)) {
    return `kotlin.collections.${type}`;
  }
  throw new Error(`Unknown Kotlin type: ${type}`);
}