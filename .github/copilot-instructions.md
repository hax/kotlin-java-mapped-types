# Copilot Instructions for kotlin-java-mapped-types

## Project Overview

This is a documentation generator for Kotlin-Java type mappings. The project generates comprehensive documentation for the 32 type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types).

**Key purpose**: Fetch type signatures from official API documentation (Android Developer Docs and Kotlin API Reference) and create detailed mapping files showing how Kotlin types correspond to Java types.

## Technology Stack

- **Runtime**: Node.js >= 22.0.0 (uses native TypeScript support via `--experimental-strip-types`)
- **Language**: TypeScript with strict mode enabled
- **Key Dependencies**:
  - `cheerio`: HTML parsing for web scraping
  - `yaml`: YAML file generation
- **Build**: No build step required - uses Node's experimental native TypeScript stripping

## Project Structure

```
.
├── src/                              # TypeScript source files
│   ├── fetch-java-api.ts            # Fetch from Android docs
│   ├── fetch-kotlin-api.ts          # Fetch from Kotlin docs  
│   ├── fetch-java-definition.ts     # Generate Java definitions
│   ├── fetch-kotlin-definition.ts   # Generate Kotlin definitions
│   ├── generate-mapping-details.ts  # Create signature mappings
│   ├── generate-mapped-types-yaml.ts # Aggregate all mappings
│   └── generate-all.ts              # Main orchestrator
├── mappings/                         # Generated output (gitignored)
│   └── <kotlin_Type>_to_<java_Type>/
│       ├── java-definition.java
│       ├── kotlin-definition.kt
│       └── mapping-details.yaml
└── mapped-types.yaml                 # Master mapping file (generated)
```

## Commands

### Development
- `npm install` - Install dependencies
- `npm run typecheck` - Run TypeScript type checking (no emit)
- `npm run generate` - Generate all type mappings (main command)
- `npm run generate:mapping-details` - Generate only mapping details from existing definitions
- `npm run generate:mapped-types` - Aggregate all mappings into mapped-types.yaml

### CI/CD
- GitHub Actions CI runs on push/PR to main/master
- Tests Node.js versions: 22.x, 24.x
- Runs: `npm ci`, `npm run typecheck`, timeout-limited `npm run generate`

## Coding Conventions

### TypeScript Style
- **Strict mode**: All TypeScript strict checks enabled
- **Module system**: ES modules (`"type": "module"` in package.json)
- **Target**: ES2022
- **Import extensions**: Use `.ts` extensions in imports (required for `allowImportingTsExtensions`)
- **Comments**: Use JSDoc-style comments for exported functions
- **No build artifacts**: `noEmit: true` - type checking only

### Common Patterns
- **File headers**: Include shebang (`#!/usr/bin/env node`) and description comment for executable scripts
- **Error handling**: Use try-catch for network operations, log errors to console
- **Async/await**: Prefer async/await over raw promises
- **File operations**: Use `fs/promises` for async file operations
- **Path handling**: Use `path.join()` for cross-platform compatibility
- **Main module check**: Use `if (import.meta.url.endsWith(process.argv[1]))` for script entry points

### Naming Conventions
- **Variables/functions**: camelCase
- **Types/interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for exported constants
- **Files**: kebab-case for source files

### Type Definitions
- **Prefer interfaces** for object shapes
- **Define explicit types** for function return values
- **Use union types** for variants (e.g., `'class' | 'interface'`)

## Important Implementation Details

### The 32 Mapped Types
The project documents exactly 32 type mappings in 5 categories:
1. **Primitive Types** (8): Byte, Short, Int, Long, Char, Float, Double, Boolean
2. **Common Types** (4): Any, String, CharSequence, Throwable  
3. **Interfaces** (4): Cloneable, Comparable, Enum, Annotation
4. **Read-only Collections** (8): Iterator, Iterable, Collection, Set, List, ListIterator, Map, Map.Entry
5. **Mutable Collections** (8): Mutable variants of the above

### Data Sources
- **Java types**: Android Developer Documentation (`https://developer.android.com/reference/`)
- **Kotlin types**: Kotlin API Reference (`https://kotlinlang.org/api/core/kotlin-stdlib/`)

### Key Mapping Patterns
- Kotlin properties → Java getter methods (e.g., `length: Int` → `int length()`)
- Kotlin operator functions → Java methods (e.g., `get(index)` → `charAt(index)`)
- Read-only vs Mutable collections map to same Java types but with different available operations

### Generated Files
- **java-definition.java**: Complete Java type with all method signatures
- **kotlin-definition.kt**: Kotlin type with available operations for that type variant
- **mapping-details.yaml**: Signature-to-signature mappings
- **mapped-types.yaml**: Aggregated master file with kind and name only

## Development Workflow

1. Make changes to TypeScript source files in `src/`
2. Run `npm run typecheck` to verify types
3. Test execution with `npm run generate` (may timeout in CI due to network calls - this is expected)
4. Generated files go to `mappings/` directory (gitignored)
5. Commit only source changes, not generated output

## Common Tasks

### Adding New Mapped Type
1. Add entry to `MAPPED_TYPES` array in `src/generate-all.ts`
2. Ensure both Kotlin and Java type names are fully qualified
3. Run `npm run generate` to create mapping files

### Modifying Parsing Logic
- Java parsing: Edit `src/fetch-java-api.ts` or `src/fetch-java-definition.ts`
- Kotlin parsing: Edit `src/fetch-kotlin-api.ts` or `src/fetch-kotlin-definition.ts`
- Mapping logic: Edit `src/generate-mapping-details.ts`

### Updating Documentation
- Main README: `README.md` (English) and `README.zh-CN.md` (Chinese)
- Implementation details: `SUMMARY.md`

## Testing Notes

- No formal test suite currently (`npm test` shows "no test specified")
- CI validates script can execute without crashing
- Manual verification involves checking generated mapping files
- Network timeouts in CI are expected and allowed (exit code 124)

## What NOT to Do

- Don't commit files in `mappings/` directory - these are generated
- Don't commit `node_modules/` or `dist/` directories
- Don't add build steps - the project intentionally uses native TS stripping
- Don't change TypeScript strict mode settings
- Don't modify the list of 32 mapped types without careful consideration of Kotlin spec

## Dependencies

When adding dependencies:
- Prefer minimal, well-maintained packages
- Check compatibility with Node.js 22+
- Add type definitions (`@types/*`) as devDependencies if needed
- Use `npm install` (updates package-lock.json)
