# Technical Documentation

## Architecture Overview

This project generates comprehensive documentation for Kotlin-Java type mappings by fetching type information from official documentation sources and analyzing member-to-member correspondences.

### Core Components

1. **Fetching Layer** (`fetch-text.ts`): HTTP client with automatic caching via `make-fetch-happen`
2. **Extraction Layer** (`get-java-def.ts`, `get-kotlin-def.ts`): Parse HTML and source code to extract type definitions
3. **Analysis Layer** (`mappings.ts`): Parse definitions and calculate member mappings
4. **Generation Layer** (`cli/`): Orchestrate the process and generate output files

### Workflow

```
1. Fetch mapped types list from kotlinlang.org
   ↓
2. For each type pair:
   - Fetch Java type HTML from developer.android.com
   - Fetch Kotlin type HTML from kotlinlang.org/api
   - Fetch Kotlin source code from GitHub (via kotlinlang.org reference)
   ↓
3. Extract type signatures from HTML/source
   ↓
4. Generate definition files (.java, .kt)
   ↓
5. Parse definition files to structured data
   ↓
6. Calculate member mappings between Java and Kotlin
   ↓
7. Generate mapped-types.md documentation
```

## Data Flow

### Phase 1: Type List Extraction

**Input**: Kotlin documentation URL  
**Process**: 
- Fetch HTML from `https://kotlinlang.org/docs/java-interop.html`
- Parse tables in the "Mapped Types" section
- Extract Java and Kotlin type names from table cells
- Qualify type names with full packages

**Output**: Array of `[java: string, kotlin: string]` tuples

### Phase 2: Definition Generation

**For Java Types:**
- Fetch HTML from Android Developer documentation
- Extract `.api-signature` elements containing:
  - Class/interface declaration
  - Method signatures
  - Inheritance relationships
- Format as Java source with package and type declaration

**For Kotlin Types:**
- Fetch HTML from Kotlin API documentation
- Extract source link from documentation page
- Fetch source code from GitHub
- Extract type definition starting from documented line number
- Return source code segment (class declaration and members)

**Output**: Definition files in `.defs/` directory

### Phase 3: Mapping Calculation

**Parsing:**
- Java definitions: Parse package, type declaration, modifiers, members
- Kotlin definitions: Parse package, type declaration, properties, functions
- Extract: name, kind (property/method/constructor), modifiers, type signature

**Mapping Algorithm:**

1. **Nullary Method to Property**: 
   - Java: `public T methodName()`
   - Kotlin: `val propertyName: T`
   - Match by name or accessor pattern (getter/setter)

2. **Accessor Pattern Recognition**:
   - `getMessage()` → `message`
   - `getName()` → `name`
   - `getCause()` → `cause`

3. **Collection Naming Conventions**:
   - `keySet()` → `keys`
   - `entrySet()` → `entries`
   - `values()` → `values`

4. **Special Operators**:
   - `charAt(int)` → `get(index: Int)` (operator function)
   - `remove(int)` → `removeAt(index: Int)`

5. **Conversion Methods**:
   - `byteValue()` → `toByte()`
   - `intValue()` → `toInt()`
   - Pattern: `*Value()` → `to*()`

### Phase 4: Documentation Generation

**Format**: Markdown with hierarchical structure
- Type pair heading: `## java.type <-> kotlin.Type`
- Member mappings:
  ```
  - memberName
    `java signature`
    `kotlin signature`
  ```

## Implementation Details

### URL Generation

**Kotlin Types:**
```typescript
// kotlin.collections.MutableMap
// → https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-mutable-map/

function kotlinDocUrl(packageName: string, typeName: string): string {
  const kebabNames = typeName.split('.')
    .map(name => name.replaceAll(/[A-Z]/g, m => '-' + m.toLowerCase()))
    .join('/');
  return `https://kotlinlang.org/api/core/kotlin-stdlib/${packageName}/${kebabNames}/`;
}
```

**Java Types:**
```typescript
// java.util.Map
// → https://developer.android.com/reference/java/util/Map

function androidDocUrl(packageName: string, typeName: string): string {
  const packagePath = packageName.replaceAll('.', '/');
  return `https://developer.android.com/reference/${packagePath}/${typeName}`;
}
```

### Type Name Qualification

The project automatically qualifies short type names:

**Java:**
- Primitives: `int`, `byte`, etc. → unchanged
- `String`, `Iterable` → `java.lang.*`
- `List`, `Map`, etc. → `java.util.*`
- Arrays: `String[]` → `java.lang.String[]`

**Kotlin:**
- Collections: `List`, `MutableMap`, etc. → `kotlin.collections.*`
- Other: Must start with `kotlin.` prefix

### Caching Strategy

Uses `make-fetch-happen` for transparent HTTP caching:

**Cache Behavior:**
- Default: Fetch from network, store in cache
- Offline mode (`--offline`): Only use cache, fail if missing
- Cache location: `.cache/` directory (configurable)
- Cache headers: Respects standard HTTP caching headers

**Benefits:**
- Reduced network requests during development
- Faster iteration cycles
- Reproducible builds (cache can be committed)
- CI/CD friendly (works offline after initial setup)

## Parsing Strategy

### Java Definition Parsing

**Input Format:**
```java
// Source: <url>

package java.lang;

public final class String {
    public int length();
    public char charAt(int index);
}
```

**Parser Logic:**
1. Remove comments (`//` and `/* */`)
2. Extract package name from `package ...;`
3. Parse class/interface declaration with regex
4. Extract modifiers, kind, name, super types
5. Parse each member line:
   - Detect kind: constructor, method (ends with `)`), or property
   - Extract modifiers (public, static, final, etc.)
   - Extract return type
   - Extract method/property name
   - Extract parameters (for methods)

### Kotlin Definition Parsing

**Input Format:**
```kotlin
// Source: <url>

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
}
```

**Parser Logic:**
1. Remove comments and empty lines
2. Filter out annotations (`@...`)
3. Extract package name
4. Parse class/interface declaration
5. Handle primary constructor in declaration
6. Remove nested type declarations (inner classes)
7. Parse each member:
   - Match pattern: `modifiers (val|var|fun|constructor) name type`
   - Extract modifiers (open, override, operator, etc.)
   - Determine kind: property (val/var), method (fun), constructor
   - Extract name and type signature

### Member Signature Comparison

**TypeScript Representation (DTS-like):**
```typescript
// Java: public int length();
// → "public length(): int"

// Kotlin: val length: Int
// → "public length: Int"

function toDTS(member: ParsedMember): string {
  const mods = member.modifiers.join(' ') + ' ';
  if (member.kind === 'constructor') {
    return `${mods}constructor${member.type}`;
  } else {
    return `${mods}${member.name}${member.type}`;
  }
}
```

## Type Categories and Statistics

### Total Coverage
- **Primitive Types**: 8 mappings
- **Common Types**: 4 mappings  
- **Interfaces**: 4 mappings
- **Read-only Collections**: 8 mappings
- **Mutable Collections**: 8 mappings

### Mapping Patterns

**1. Direct Mappings** (same name, different syntax):
- `toString()` ↔ `toString()`
- `equals(Object)` ↔ `equals(other: Any?)`
- `hashCode()` ↔ `hashCode()`

**2. Property-Method Mappings**:
- Kotlin properties map to Java nullary methods
- Example: `length: Int` ↔ `length()`

**3. Operator Mappings**:
- Kotlin operators map to specific Java methods
- Example: `get(index)` ↔ `charAt(index)`

**4. Collection Convention Mappings**:
- Java uses method names, Kotlin uses properties
- Example: `keySet()` ↔ `keys`

**5. Type Hierarchy**:
- Read-only and mutable Kotlin collections map to same Java types
- Kotlin enforces read-only at compile time
- Java types include all methods (read and write)

### Special Cases

**Cloneable**: Skipped in generation (see issue #21)

**Arrays**: Skipped (only have `length` property)

**Primitives**: Skipped (no members to map)

**Platform Types**: Kotlin uses `!` suffix for platform types (nullable unknown)
- `java.lang.String` ↔ `kotlin.String!`

**Read-only vs Mutable Collections**:
- Same Java type, different Kotlin types
- Example: `java.util.List` ↔ both `kotlin.collections.List` and `kotlin.collections.MutableList`
- Definitions differ: read-only shows only read operations, mutable shows all operations

## Error Handling

### Network Failures
- Logged as errors with duration and URL
- Process continues with remaining types
- Returns `null` for failed fetches

### Parse Failures
- Throws detailed error messages
- Indicates which part of parsing failed
- Includes context (file content, line, etc.)

### Offline Mode
- Uses `only-if-cached` option for `make-fetch-happen`
- Fails fast if cache missing
- Ensures no network access when `--offline` flag is set

## Development Patterns

### Modular Design
- Each module has single responsibility
- Clear separation between fetching, parsing, and generation
- Reusable utilities for common operations

### Type Safety
- Full TypeScript typing throughout
- Interfaces for all data structures
- No `any` types in public APIs

### Functional Approach
- Pure functions for parsing and transformation
- Side effects isolated to I/O boundaries
- Testable and predictable behavior

### CLI Design
- Separate CLI scripts for each major operation
- Consistent `--offline` flag support
- Dry-run mode for testing (`--dry-run`)

## Future Enhancements

### Possible Improvements

1. **Incremental Generation**: Track changes and only regenerate modified types
2. **Validation Tests**: Automated tests to verify mapping accuracy
3. **Alternative Output Formats**: JSON, YAML, or structured data formats
4. **Coverage Metrics**: Track which members are mapped vs unmapped
5. **Documentation Links**: Add direct links to official documentation for each member
6. **Type Hierarchy Visualization**: Generate diagrams showing inheritance relationships
7. **Interactive Explorer**: Web-based tool to browse mappings
8. **Parallel Processing**: Generate definitions concurrently for faster execution
9. **Diff Tool**: Compare mappings between Kotlin/Java versions

### Known Limitations

1. **Generic Type Parameters**: Not fully analyzed (stripped from type names)
2. **Overloaded Methods**: All overloads shown, but not individually mapped
3. **Nested Types**: Limited support for inner classes
4. **Annotation Details**: Annotations are filtered out from parsing
5. **Default Parameters**: Kotlin default parameters not reflected in mappings
6. **Extension Functions**: Not included (not part of Java interop mappings)

## Use Cases

This documentation serves multiple purposes:

1. **Learning Resource**: Understand Kotlin-Java interoperability
2. **Reference Guide**: Look up specific type mappings when writing code
3. **Migration Tool**: Assist in converting Java code to Kotlin
4. **Teaching Material**: Educational resource for Kotlin courses
5. **API Documentation**: Comprehensive reference for library authors
6. **Code Generation**: Potential input for automated code generators

## License

ISC
