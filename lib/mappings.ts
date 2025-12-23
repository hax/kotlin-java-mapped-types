export interface ParsedMember {
  name: string;
  kind: 'property' | 'method' | 'constructor';
  modifiers: string[];
  type: string;
}

export interface ParsedType {
  package: string;
  name: string;
  kind: 'class' | 'interface';
  modifiers: string[];
  super: string[];
  members: ParsedMember[];
}

export function toDTS(member: ParsedMember): string {
  const mods = member.modifiers.length > 0 ? member.modifiers.join(' ') + ' ' : '';
  if (member.kind === 'constructor') {
    return `${mods}constructor${member.type}`;
  } else {
    return `${mods}${member.name}${member.type}`;
  }
}

/**
 * Convert a parsed Java type to TypeScript declaration format (.d.ts)
 */
export function javaTypeToDTS(parsedType: ParsedType): string {
  const { package: pkg, name, kind, modifiers, super: superTypes, members } = parsedType;
  
  // Build the declaration line
  const mods = modifiers.filter(m => m && m !== '').join(' ');
  const modStr = mods ? mods + ' ' : '';
  
  // Handle inheritance - separate extends and implements
  let extendsClause = '';
  let implementsClause = '';
  
  if (kind === 'class' && superTypes.length > 0) {
    // First superType is the extends clause, rest are implements
    extendsClause = ' extends ' + superTypes[0];
    if (superTypes.length > 1) {
      implementsClause = ' implements ' + superTypes.slice(1).join(', ');
    }
  } else if (kind === 'interface' && superTypes.length > 0) {
    // For interfaces, all are extends
    extendsClause = ' extends ' + superTypes.join(', ');
  }
  
  // Format members
  const memberLines = members.map(member => {
    return '  ' + toDTS(member);
  });
  
  // Build the complete DTS
  const declaration = `${modStr}${kind} ${name}${extendsClause}${implementsClause} {
${memberLines.join('\n')}
}`;
  
  return `/**
 * @packageDocumentation
 * Package: ${pkg}
 */

${declaration}`;
}

function removeComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '');        // Remove line comments
}

export function parseJavaDef(content: string): ParsedType {
  const lines = removeComments(content).split('\n')
    .filter(line => line.trim() != '');

  const packageLine = lines.shift()
  if (packageLine == null || !packageLine.startsWith('package ')) {
    throw new Error('No package declaration found in Java definition.');
  }
  const packageName = packageLine.slice('package '.length, -";".length).trim();

  const declarationLine = lines.shift()
  if (declarationLine == null || (!declarationLine.includes(' class ') && !declarationLine.includes(' interface '))) {
    throw new Error('No class or interface declaration found in Java definition.');
  }
  const groups = declarationLine.match(
    /^(?<modifiers>.*)(?<kind>class|interface) (?<name>.+?)( extends (?<superClass>.+?))?( implements (?<interfaces>.+))?{$/
  )!.groups!;
  const modifiers = groups.modifiers.trim().split(/\s+/)
  const kind = groups.kind as 'class' | 'interface';
  const typeName = groups.name.trim();
  const superTypes: string[] = [];
  if (groups.superClass) {
    superTypes.push(groups.superClass.trim());
  }
  if (groups.interfaces) {
    superTypes.push(groups.interfaces.trim());
  }

  const lastLine = lines.pop();
  if (lastLine == null || lastLine.trim() !== '}') {
    throw new Error('Java definition does not end with a closing brace.');
  }

  const members: ParsedMember[] = lines.map(line => {
    line = line.trim();
    if (!line.endsWith(';')) {
      throw new Error(`Invalid member declaration: ${line}`);
    }
    line = line.slice(0, -1).trimEnd(); // Remove trailing semicolon
    let kind: 'property' | 'method' | 'constructor' = line.at(-1) == ')' ? 'method' : 'property';
    let params: string | undefined
    if (kind == "method") {
      const i = line.lastIndexOf('(');
      params = line.slice(i)
      line = line.slice(0, i).trimEnd();
    }
    const i = line.lastIndexOf(' ');
    const name = line.slice(i + 1)
    line = line.slice(0, i + 1);
    const groups = /^(?<modifiers>((public|private|protected|static|final|abstract|synchronized|native|transient|volatile|strictfp)\s+)*)(?<type>.*?)$/.exec(line)!.groups!;
    const modifiers = groups.modifiers.trim().split(/\s+/);
    const typePart = groups.type.trim();
    if (typePart == "") {
      if (kind == "method" && typeName == name) {
        kind = "constructor"
      } else {
        throw new Error(`Could not determine type for member: ${line}`);
      }
    }
    const type = params ? kind == "method" ? `${params}: ${typePart}` : params : typePart;
    
    return { kind, name, modifiers, type };
  })  
  
  return { package: packageName, name: typeName, kind, modifiers, super: superTypes, members };
}

export function parseKotlinDef(content: string): ParsedType {
  const lines = removeComments(content).split('\n')
    .map(line => line.trim())
    .filter(line => line != '')
    .filter(line => !line.startsWith("@"))
    .filter(line => !line.endsWith("{}"))
  
  const packageLine = lines.shift()
  if (packageLine == null || !packageLine.startsWith('package ')) {
    throw new Error('No package declaration found in Kotlin definition.');
  }
  const packageName = packageLine.slice('package '.length).trim();

  const declarationLine = lines.shift()
  if (declarationLine == null || (!declarationLine.includes(' class ') && !declarationLine.includes(' interface '))) {
    console.error(content);
    throw new Error('No class or interface declaration found in Kotlin definition.');
  }
  const groups = declarationLine.match(
    /^(?<modifiers>.*)(?<kind>class|interface) (?<name>.+?)(\s*:\s*(?<super>.+?))?{?$/
  )!.groups!;
  const modifiers = groups.modifiers.trim().split(/\s+/)
  const kind = groups.kind as 'class' | 'interface';
  const name = groups.name.trim();
  let typeName: string;
  let primaryConstructor: ParsedMember | undefined;
  if (name.endsWith(')')) {
    const i = name.lastIndexOf('(');
    typeName = name.slice(0, i).trim();
    primaryConstructor = {
      kind: 'constructor',
      name: typeName,
      modifiers: [],
      type: name.slice(i)
    };
  } else {
    typeName = name;
  }
  const superTypes: string[] = groups.super ? [groups.super.trim()] : [];

  if (declarationLine.endsWith('{')) {
    const lastLine = lines.pop();
    if (lastLine == null || lastLine.trim() !== '}') {
      throw new Error('Kotlin definition does not end with a closing brace.');
    }
  }

  // remove nested declarations
  for (;;) {
    const i = lines.findIndex(line => line.endsWith("{"))
    if (!(i >= 0)) break;
    const n = lines.slice(i).findIndex(line => line == "}")
    if (!(n >= 0)) {
      throw new Error('Kotlin definition nest declaration is not closed.');
    }
    lines.splice(i, n + 1)
  }
 
  const members: ParsedMember[] = lines.map(line => {
    const groups = /^(?<modifiers>.*?)\s+((?<kind>var|val|fun)\s+(?<name>.+?\b)|(?<kind>constructor))(?<type>.+)$/.exec(line)!.groups!;
    const modifiers = groups.modifiers.trim().split(/\s+/);
    const kind = groups.kind == 'var' || groups.kind == 'val' ? 'property' : groups.kind == 'fun' ? 'method' : 'constructor';
    const name = groups.name
    const type = groups.type
    return { kind, name, modifiers, type };
  })
  if (primaryConstructor) {
    members.unshift(primaryConstructor);
  }
  
  return { package: packageName, name: typeName, kind, modifiers, super: superTypes, members };
}

export function calcMapping(javaType: ParsedType, kotlinType: ParsedType) {
  const mappings: [java: ParsedMember, kotlin: ParsedMember][] = [];

  if (javaType.kind != kotlinType.kind) {
    throw new Error(`Type kinds do not match: Java is ${javaType.kind}, Kotlin is ${kotlinType.kind}`);
  }
  
  const javaNullaryInstanceMethods = javaType.members.filter(m => 
    !m.modifiers.includes('static') && isNullaryMethod(m)
  );

  for (const method of javaNullaryInstanceMethods) {
      
    const propertyName = accessorPropertyName(method.name);
    if (propertyName != null) {
      const kotlinProperty = findProperty(kotlinType, propertyName);
      if (kotlinProperty != null) {
        mappings.push([method, kotlinProperty]);
        continue;
      }
    }

    const kotlinProperty = findProperty(kotlinType, method.name);
    if (kotlinProperty != null) {
      mappings.push([method, kotlinProperty]);
      continue;
    }

    if (method.name == "keySet") {
      const kotlinProperty = findProperty(kotlinType, "keys");
      if (kotlinProperty != null) {
        mappings.push([method, kotlinProperty]);
        continue;
      }
    }

    if (method.name == "entrySet") {
      const kotlinProperty = findProperty(kotlinType, "entries");
      if (kotlinProperty != null) {
        mappings.push([method, kotlinProperty]);
        continue;
      }
    }

    if (method.name.endsWith("Value")) {
      const baseName = method.name.slice(0, -"Value".length);
      if (baseName) {
        const kotlinMethodName = "to" + upperCaseFirst(baseName);
        const kotlinMethod = findNullaryMethod(kotlinType, kotlinMethodName);
        if (kotlinMethod != null) {
          mappings.push([method, kotlinMethod]);
          continue;
        }
      }
    }
  }
  
  const javaMethod = findUnaryMethod(javaType, "charAt");
  const kotlinMethod = findUnaryMethod(kotlinType, "get");
  if (javaMethod != null && kotlinMethod != null) {
    mappings.push([javaMethod, kotlinMethod]);
  }

  return mappings;
}

function findProperty(type: ParsedType, name: string): ParsedMember | undefined {
  return type.members.find(m => m.name == name && m.kind == 'property');
}

function findNullaryMethod(type: ParsedType, name: string): ParsedMember | undefined {
  return type.members.find(m => m.name == name && isNullaryMethod(m));
}

function isNullaryMethod(member: ParsedMember) {
  return member.kind == 'method' && /^\s*\(\s*\)/.test(member.type) 
}

function findUnaryMethod(type: ParsedType, name: string): ParsedMember | undefined {
  return type.members.find(m => m.name == name && m.kind == 'method' && /^\s*\(\s*[^,]+\s*\)/.test(m.type));
}

function upperCaseFirst(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

function lowerCaseFirst(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

function accessorPropertyName(name: string): string | undefined {
  for (const prefix of ["get", "set"]) {
    if (name.startsWith(prefix) && name.length > prefix.length) {
      return lowerCaseFirst(name.slice(prefix.length));
    }
  }
  return undefined;
}


