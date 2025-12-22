/**
 * Utilities for simplifying method and property signatures
 */

/**
 * Simplifies a signature by extracting just the essential parts (name and parameter names)
 * @param signature The full signature string (Java or Kotlin format)
 * @returns A simplified signature with just the method/property name and parameter names
 */
export function simplifySignature(signature: string): string {
  const trimmed = signature.trim();
  
  // Kotlin property: "val name" or "var name"
  const kotlinPropertyMatch = trimmed.match(/(?:override\s+)?(?:val|var)\s+(\w+)/);
  if (kotlinPropertyMatch) {
    return kotlinPropertyMatch[1];
  }
  
  // Kotlin function: "fun name(params)"
  const kotlinFuncMatch = trimmed.match(/(?:override\s+)?(?:operator\s+)?fun\s+(\w+)\s*\(([^)]*)\)/);
  if (kotlinFuncMatch) {
    const funcName = kotlinFuncMatch[1];
    const params = kotlinFuncMatch[2];
    
    if (params.trim()) {
      const paramNames = parseKotlinParams(params);
      return `${funcName}(${paramNames.join(', ')})`;
    }
    return `${funcName}()`;
  }
  
  // Java method: "public Type methodName(params)"
  const javaMethodMatch = trimmed.match(/(?:public|protected|private|static|abstract|final|\s)+(?:\w+(?:<[^>]+>)?(?:\[\])?)\s+(\w+)\s*\(([^)]*)\)/);
  if (javaMethodMatch) {
    const methodName = javaMethodMatch[1];
    const params = javaMethodMatch[2];
    
    if (params.trim()) {
      const paramNames = parseJavaParams(params);
      return `${methodName}(${paramNames.join(', ')})`;
    }
    return `${methodName}()`;
  }
  
  return trimmed;
}

/**
 * Parse Kotlin parameter list and extract parameter names
 */
function parseKotlinParams(params: string): string[] {
  const paramSegments: string[] = [];
  let current = '';
  let depth = 0;
  
  for (let i = 0; i < params.length; i++) {
    const ch = params[i];
    if (ch === '<') {
      depth++;
    } else if (ch === '>') {
      depth = Math.max(0, depth - 1);
    }
    if (ch === ',' && depth === 0) {
      if (current.trim()) {
        paramSegments.push(current.trim());
      }
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) {
    paramSegments.push(current.trim());
  }
  
  return paramSegments
    .map(p => {
      const paramMatch = p.match(/(\w+)\s*:/);
      return paramMatch ? paramMatch[1] : '';
    })
    .filter(n => n);
}

/**
 * Parse Java parameter list and extract parameter names
 */
function parseJavaParams(params: string): string[] {
  const paramList: string[] = [];
  let depth = 0;
  let currentParam = '';
  
  for (const char of params) {
    if (char === '<') {
      depth++;
      currentParam += char;
    } else if (char === '>') {
      depth--;
      currentParam += char;
    } else if (char === ',' && depth === 0) {
      paramList.push(currentParam);
      currentParam = '';
    } else {
      currentParam += char;
    }
  }
  if (currentParam) {
    paramList.push(currentParam);
  }
  
  return paramList.map(p => {
    const trimmedParam = p.trim();
    let depth = 0;
    let lastIdentifierStart = -1;
    let lastIdentifierEnd = -1;
    
    for (let i = 0; i < trimmedParam.length; i++) {
      const char = trimmedParam[i];
      if (char === '<') {
        depth++;
      } else if (char === '>') {
        depth--;
      } else if (depth === 0 && /\w/.test(char)) {
        if (lastIdentifierStart === -1 || /\s/.test(trimmedParam[i - 1] || ' ')) {
          lastIdentifierStart = i;
        }
        lastIdentifierEnd = i;
      }
    }
    
    if (lastIdentifierStart !== -1) {
      const paramName = trimmedParam.substring(lastIdentifierStart, lastIdentifierEnd + 1);
      return paramName.replace(/[\[\]]/g, '');
    }
    return '';
  }).filter(n => n);
}

/**
 * Extracts the method name from a simplified signature
 * @param simplifiedSignature A simplified signature like "methodName(param1, param2)"
 * @returns The method name without parameters
 */
export function extractMethodName(simplifiedSignature: string): string {
  const match = simplifiedSignature.match(/^(\w+)\(/);
  return match ? match[1] : simplifiedSignature;
}
