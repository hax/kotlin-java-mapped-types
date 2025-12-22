import * as fs from 'fs/promises';

export interface TypeInfo {
  kind: string;
  name: string;
}

export async function extractTypeInfo(defFile: string): Promise<TypeInfo | null> {
  try {
    const content = await fs.readFile(defFile, 'utf-8');
    const lines = content.split('\n');
    
    let kind = '';
    let name = '';
    let packageName = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      const pkgMatch = trimmed.match(/^package\s+([\w.]+)/);
      if (pkgMatch) {
        packageName = pkgMatch[1];
      }
      
      const javaMatch = trimmed.match(/(?:public\s+)?(?:final\s+)?(class|interface)\s+(\w+)/);
      if (javaMatch) {
        kind = javaMatch[1];
        name = packageName ? `${packageName}.${javaMatch[2]}` : javaMatch[2];
        break;
      }
      
      const kotlinMatch = trimmed.match(/^(?:open\s+)?(class|interface)\s+(\w+)/);
      if (kotlinMatch) {
        kind = kotlinMatch[1];
        name = packageName ? `${packageName}.${kotlinMatch[2]}` : kotlinMatch[2];
        break;
      }
    }
    
    return kind && name ? { kind, name } : null;
  } catch (error) {
    return null;
  }
}

export function typeNameToKotlinUrl(typeName: string): string {
  const parts = typeName.split('.');
  let packageEndIndex = parts.findIndex(part => /^[A-Z]/.test(part));
  if (packageEndIndex === -1) {
    packageEndIndex = parts.length;
  }
  
  const packagePath = parts.slice(0, packageEndIndex).join('.');
  const classNames = parts.slice(packageEndIndex);
  const kebabNames = classNames.map(name => 
    name.replace(/([A-Z])/g, '-$1').toLowerCase()
  ).join('/');
  
  return `https://kotlinlang.org/api/core/kotlin-stdlib/${packagePath}/${kebabNames}/`;
}

export function typeNameToJavaUrl(typeName: string): string {
  const parts = typeName.split('.');
  let packageEndIndex = parts.findIndex(part => /^[A-Z]/.test(part));
  if (packageEndIndex === -1) {
    packageEndIndex = parts.length;
  }
  
  const packagePath = parts.slice(0, packageEndIndex).join('/');
  const classPath = parts.slice(packageEndIndex).join('.');
  
  return `https://developer.android.com/reference/${packagePath}/${classPath}`;
}
