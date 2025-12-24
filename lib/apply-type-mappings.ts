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
  appliedMappings: Array<{ from: string; to: string }>;
  unmappedTypes: string[];
} {
  const appliedMappings: Array<{ from: string; to: string }> = [];
  const unmappedTypes: string[] = [];
  const seenUnmapped = new Set<string>();
  
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
            appliedMappings.push({ from: typeName, to: kotlinTypeName });
            
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
          } else {
            // Track unmapped types
            if (!seenUnmapped.has(typeName)) {
              seenUnmapped.add(typeName);
              unmappedTypes.push(typeName);
            }
          }
        }
        
        // Handle keyword types (e.g., boolean, number, string as TS keywords)
        if (ts.isToken(node) && node.kind >= ts.SyntaxKind.FirstKeyword && node.kind <= ts.SyntaxKind.LastKeyword) {
          const text = node.getText(sourceFile);
          const mapping = typeMap.get(text);
          
          if (mapping) {
            // Replace keyword type with mapped type reference
            const kotlinTypeName = mapping.kotlinType;
            appliedMappings.push({ from: text, to: kotlinTypeName });
            
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
    appliedMappings,
    unmappedTypes
  };
}
