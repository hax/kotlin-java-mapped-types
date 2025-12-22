/**
 * Shared utility functions
 */

import * as fs from 'fs/promises';

export interface TypeInfo {
  kind: string;
  name: string;
}

/**
 * Extract type information from a definition file
 */
export async function extractTypeInfo(defFile: string): Promise<TypeInfo | null> {
  try {
    const content = await fs.readFile(defFile, 'utf-8');
    const lines = content.split('\n');
    
    let kind = '';
    let name = '';
    let packageName = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Parse package
      const pkgMatch = trimmed.match(/^package\s+([\w.]+)/);
      if (pkgMatch) {
        packageName = pkgMatch[1];
      }
      
      // Parse class/interface for Java
      const javaMatch = trimmed.match(/(?:public\s+)?(?:final\s+)?(class|interface)\s+(\w+)/);
      if (javaMatch) {
        kind = javaMatch[1];
        name = packageName ? `${packageName}.${javaMatch[2]}` : javaMatch[2];
        break;
      }
      
      // Parse class/interface for Kotlin
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
