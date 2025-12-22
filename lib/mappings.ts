interface ParsedMember {
  name: string;
  kind: 'property' | 'method' | 'constructor';
  modifiers: string[];
  signature: string;
}

interface ParsedType {
  package: string;
  name: string;
  kind: 'class' | 'interface';
  modifiers: string[];
  super: string[];
  members: ParsedMember[];
}

function removeComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '');        // Remove line comments
}

export function parseJavaDef(content: string): ParsedType {
  const lines = removeComments(content).split('\n').filter(line => line.trim() != '');

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
    const groups = /^(?<modifiers>(public|private|protected|static|final|abstract|synchronized|native|transient|volatile|strictfp)\s+)*(?<type>.*?)$/.exec(line)!.groups!;
    const modifiers = groups.modifiers.trim().split(/\s+/);
    const type = groups.type.trim();
    if (type == "") {
      if (kind == "method" && typeName == name) {
        kind = "constructor"
      } else {
        throw new Error(`Could not determine type for member: ${line}`);
      }
    }
    const signature = params ? kind == "method" ? `${params} -> ${type}` : params : type;
    
    return { kind, name, modifiers, signature };
  })  
  
  return { package: packageName, name: typeName, kind, modifiers, super: superTypes, members };
}

export function parseKotlinDef(content: string): ParsedType {
  const lines = removeComments(content).split('\n').map(line => line.trim()).filter(line => line != '');

  const packageLine = lines.shift()
  if (packageLine == null || !packageLine.startsWith('package ')) {
    throw new Error('No package declaration found in Kotlin definition.');
  }
  const packageName = packageLine.slice('package '.length).trim();

  const declarationLine = lines.shift()
  if (declarationLine == null || (!declarationLine.includes(' class ') && !declarationLine.includes(' interface '))) {
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
      signature: name.slice(i)
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

  const members: ParsedMember[] = lines.filter(line => !line.startsWith("@")).map(line => {
    console.log(line)
    const groups = /^(?<modifiers>.*?)\s+(?<kind>var|val|fun|constructor)\s+(?<name>.+?\b)(?<signature>.+)$/.exec(line)!.groups!;
    const modifiers = groups.modifiers.trim().split(/\s+/);
    const kind = groups.kind == 'var' || groups.kind == 'val' ? 'property' : groups.kind == 'fun' ? 'method' : 'constructor';
    const name = groups.name
    const signature = groups.signature

    return { kind, name, modifiers, signature };
  })
  if (primaryConstructor) {
    members.unshift(primaryConstructor);
  }
  
  return { package: packageName, name: typeName, kind, modifiers, super: superTypes, members };
}

export function calcMapping(javaType: ParsedType, kotlinType: ParsedType) {
  const mappings: Array<{ kotlin: string; java: string }> = [];
  
  for (const kotlinMember of kotlinType.members) {
    for (const javaMember of javaType.members) {
      let isMatch = false;
      
      if (kotlinMember.name === javaMember.name) {
        isMatch = true;
      } else if (kotlinMember.kind === 'property') {
        const getterName = 'get' + kotlinMember.name.charAt(0).toUpperCase() + kotlinMember.name.slice(1);
        if (javaMember.name === getterName) {
          isMatch = true;
        }
      } else if (kotlinMember.name === 'get' && javaMember.name === 'charAt') {
        isMatch = true;
      } else if (kotlinMember.name === 'removeAt' && javaMember.name === 'remove') {
        if (javaMember.signature.includes('int index') || javaMember.signature.includes('int,')) {
          isMatch = true;
        }
      }
      
      if (isMatch) {
        mappings.push({
          kotlin: kotlinMember.name,
          java: javaMember.name
        });
      }
    }
  }
  
  return mappings;
}

