/**
 * AST transformation to apply Kotlin type mappings to TypeScript d.ts
 */

import * as ts from 'typescript';

export interface TypeMapping {
  kotlinType: string;
  nullable: '?' | '!' | '';
}

/**
 * Transform TypeScript AST to replace Java types with Kotlin types
 */
export function transformTypesInAST(
  sourceFile: ts.SourceFile,
  typeMap: Map<string, TypeMapping>
): { 
  transformed: ts.SourceFile;
  appliedMappings: Array<{ from: string; to: string; path: string }>;
} {
  const appliedMappings: Array<{ from: string; to: string; path: string }> = [];
  
  // Helper to build TypeScript-style location path for the type
  function getNodePath(node: ts.Node): string {
    // Helper to check if a node is a descendant of another
    function isNodeDescendantOf(node: ts.Node, ancestor: ts.Node): boolean {
      let current: ts.Node | undefined = node;
      while (current) {
        if (current === ancestor) return true;
        current = current.parent;
      }
      return false;
    }
    
    let current: ts.Node | undefined = node.parent;
    let typeName: string | undefined;
    let memberName: string | undefined;
    let context: 'return' | 'param' | 'property' | undefined;
    let paramIndex: number | undefined;
    
    // Walk up to find the containing member and type
    while (current && current !== sourceFile) {
      if (ts.isParameter(current)) {
        // We're inside a parameter - find its index
        const methodNode = current.parent;
        if (methodNode && (ts.isMethodSignature(methodNode) || ts.isMethodDeclaration(methodNode))) {
          paramIndex = methodNode.parameters.indexOf(current as ts.ParameterDeclaration);
          memberName = methodNode.name?.getText(sourceFile) || 'anonymous';
          context = 'param';
        }
      } else if (ts.isMethodSignature(current) || ts.isMethodDeclaration(current)) {
        if (!memberName) {
          memberName = current.name?.getText(sourceFile) || 'anonymous';
          // Check if we're in the return type by checking node ancestry
          if (current.type && isNodeDescendantOf(node, current.type)) {
            context = 'return';
          } else if (context !== 'param') {
            // If we haven't identified as param yet, default to return for method context
            context = 'return';
          }
        }
      } else if (ts.isPropertySignature(current) || ts.isPropertyDeclaration(current)) {
        memberName = current.name?.getText(sourceFile) || 'anonymous';
        context = 'property';
      } else if (ts.isInterfaceDeclaration(current) || ts.isClassDeclaration(current)) {
        typeName = current.name?.getText(sourceFile) || 'anonymous';
        break;
      }
      current = current.parent;
    }
    
    // Build TypeScript-style path
    if (typeName && memberName) {
      if (context === 'return') {
        return `ReturnType<${typeName}["${memberName}"]>`;
      } else if (context === 'param' && paramIndex !== undefined) {
        return `Parameters<${typeName}["${memberName}"]>[${paramIndex}]`;
      } else if (context === 'property') {
        return `${typeName}["${memberName}"]`;
      }
    }
    
    // Fallback for cases we haven't handled
    return typeName || 'unknown';
  }
  
  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        // Handle type references (e.g., Map, String, Integer, etc.)
        if (ts.isTypeReferenceNode(node)) {
          const typeName = node.typeName.getText(sourceFile);
          const mapping = typeMap.get(typeName);
          
          if (mapping) {
            // Found a mapping - replace the type
            const kotlinTypeName = mapping.kotlinType;
            const nodePath = getNodePath(node);
            appliedMappings.push({ from: typeName, to: kotlinTypeName, path: nodePath });
            
            // Create new type reference with Kotlin type name
            const newTypeName = ts.factory.createIdentifier(kotlinTypeName);
            
            // Handle nullable types (X? becomes ?X in the output)
            // For now, just replace the type name, nullability handling comes later
            
            // Recursively transform type arguments (generics)
            const newTypeArguments = node.typeArguments 
              ? ts.factory.createNodeArray(node.typeArguments.map(arg => ts.visitNode(arg, visitor) as ts.TypeNode))
              : undefined;
            
            return ts.factory.updateTypeReferenceNode(
              node,
              newTypeName,
              newTypeArguments
            );
          }
        }
        
        // Handle keyword types (e.g., boolean, number, string as TS keywords)
        if (ts.isToken(node) && node.kind >= ts.SyntaxKind.FirstKeyword && node.kind <= ts.SyntaxKind.LastKeyword) {
          const text = node.getText(sourceFile);
          const mapping = typeMap.get(text);
          
          if (mapping) {
            // Replace keyword type with mapped type reference
            const kotlinTypeName = mapping.kotlinType;
            const nodePath = getNodePath(node);
            appliedMappings.push({ from: text, to: kotlinTypeName, path: nodePath });
            
            return ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier(kotlinTypeName),
              undefined
            );
          }
        }
        
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };
  
  const result = ts.transform(sourceFile, [transformer]);
  const transformed = result.transformed[0];
  result.dispose();
  
  return {
    transformed,
    appliedMappings
  };
}
