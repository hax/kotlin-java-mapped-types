# Copilot Instructions for kotlin-java-mapped-types

## Project Overview

This project generates comprehensive and precise documentation for type mappings between Kotlin and Java as specified in the [Kotlin documentation](https://kotlinlang.org/docs/java-interop.html#mapped-types). It automatically fetches type information from official documentation sources and produces structured, machine-readable member-to-member mappings.

**Key purpose**: 
- Fetch Kotlin-Java type mappings from official documentation
- Generate detailed type definitions for both Java and Kotlin types
- Calculate and document member-to-member correspondence between mapped types
- Provide a tool to map Java type definitions to Kotlin equivalents in d.ts format

## Technology Stack

- **Runtime**: Node.js >= 24.0.0 (uses native TypeScript execution via `node` command)
- **Language**: TypeScript with strict mode and verbatim module syntax
- **Key Dependencies**:
  - `cheerio`: HTML parsing for web scraping API documentation
  - `make-fetch-happen`: HTTP client with automatic caching
  - `typescript`: Type checking and AST manipulation (production dependency)
  - `tsx`: Test runner for TypeScript (dev dependency)
  - `@types/node`: Node.js type definitions (dev dependency)
  - `@types/make-fetch-happen`: Type definitions for fetch client (dev dependency)
- **Build**: No build step required - TypeScript files run directly via Node.js native support

## Project Structure

```
.
├── lib/                              # TypeScript source files
│   ├── cli/                          # Command-line entry points
│   │   ├── get-mapped-types.ts      # Fetch mapped types list from Kotlin docs
│   │   ├── gen-defs.ts              # Generate type definitions for all mappings
│   │   ├── calc-mappings.ts         # Calculate member mappings
│   │   ├── gen-mapped-types.ts      # Generate mapped-types.md documentation
│   │   ├── get-def.ts               # Get single type definition
│   │   └── map-java-to-kotlin.ts    # CLI tool to map Java types to Kotlin
│   ├── config.ts                     # Path configuration (cache, defs, outputs)
│   ├── utils.ts                      # Shared utilities
│   ├── fetch-text.ts                 # HTTP fetch with automatic caching
│   ├── get-java-def.ts               # Fetch and parse Java type definitions
│   ├── get-kotlin-def.ts             # Fetch and parse Kotlin type definitions
│   ├── get-mapped-types.ts           # Extract type mapping list from Kotlin docs
│   ├── mappings.ts                   # Parse definitions and calculate mappings
│   ├── map-java-to-kotlin.ts         # Map Java types to Kotlin (programmatic API)
│   ├── apply-type-mappings.ts        # AST transformation to apply type mappings
│   └── *.test.ts                     # Test files
├── .cache/                            # HTTP response cache (auto-generated, gitignored)
├── .defs/                             # Generated type definitions (gitignored)
│   └── <java.type.Name>/
│       ├── def.java                   # Java type definition
│       └── kotlin.Type.kt             # Kotlin type definition
├── mapped-types.json                  # Type mappings in JSON format (generated)
├── mapped-types.md                    # Human-readable mapping documentation (generated)
├── TECHNICAL.md                       # Technical documentation (bilingual EN/CN)
├── MAPPER.md                          # Documentation for Java-to-Kotlin mapping tool (CN)
└── REMAINING_WORK.md                  # Project status and remaining tasks
```

## Commands

### Main Workflow
- `npm start` - Generate all documentation (runs `gen:defs` then `gen:mt` via `node --run`)
- `npm install` - Install dependencies

### Individual Commands
- `npm run typecheck` - Run TypeScript type checking (no emit)
- `npm test` - Run type checking then tests using tsx with Node.js test runner
- `npm run get:mt` - Fetch mapped types list from Kotlin documentation (runs in offline mode)
- `npm run get:def` - Get a single type definition (runs in offline mode)
- `npm run gen:defs` - Generate Java and Kotlin type definitions for all mappings
- `npm run calc:mappings` - Calculate member mappings between types
- `npm run gen:mt` - Generate mapped-types.md with detailed mappings
- `npm run map` - Map Java type definition to Kotlin d.ts format

### Flags
Commands support various flags when called directly (not via npm scripts):
- `--offline` - Use cached content only (no HTTP requests)
- `--dry-run` - Preview operations without writing files

### CI/CD
- GitHub Actions CI runs on push/PR to main/master
- Tests Node.js version: 24.x
- Runs: `npm cit` (clean install + test)

## Coding Conventions

### TypeScript Style
- **Strict mode**: All TypeScript strict checks enabled
- **Module system**: ES modules with `verbatimModuleSyntax: true`
- **Target**: ESNext
- **Import extensions**: Use `.ts` extensions in imports (required for `allowImportingTsExtensions`)
- **Comments**: Use JSDoc-style comments for exported functions
- **No build artifacts**: `noEmit: true` - type checking only

### Common Patterns
- **File operations**: Use Node.js `fs` module with async operations
- **HTTP requests**: All HTTP requests automatically cached via `make-fetch-happen`
- **Path handling**: Use `fileURLToPath(import.meta.resolve(...))` for resolving paths
- **Error handling**: Use try-catch for I/O operations, log errors to console
- **CLI parsing**: Use `process.argv` for command-line argument parsing
- **Test framework**: Use tsx with Node.js native test runner (via `node --import tsx --test`)

### Naming Conventions
- **Variables/functions**: camelCase
- **Types/interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for exported constants
- **Files**: kebab-case for source files

### Type Definitions
- **Prefer interfaces** for object shapes
- **Export types** that are part of public API
- **Use explicit return types** for public functions
- **Use union types** for variants (e.g., `'class' | 'interface'`)

## Important Implementation Details

### Core Workflow

The project follows a 4-phase pipeline:

1. **Phase 1: Fetch Mapped Types List**
   - Scrape Kotlin documentation tables for type mappings
   - Extract Java and Kotlin fully qualified type names
   - Output: Array of `[javaType, kotlinType]` tuples saved to `mapped-types.json`

2. **Phase 2: Generate Type Definitions**
   - For each type pair, fetch from official documentation
   - Java: Extract API signatures from Android Developer docs
   - Kotlin: Fetch source code from GitHub via Kotlin API reference
   - Output: `.java` and `.kt` files in `.defs/` directory

3. **Phase 3: Calculate Mappings**
   - Parse definition files to extract members
   - Match corresponding members using mapping rules:
     - Nullary getters → properties (e.g., `length()` → `length`)
     - Accessor patterns (e.g., `getMessage()` → `message`)
     - Collection conventions (e.g., `keySet()` → `keys`)
     - Special operators (e.g., `charAt(int)` → `get(index: Int)`)
     - Conversion methods (e.g., `intValue()` → `toInt()`)
   - Output: Structured mapping data

4. **Phase 4: Generate Documentation**
   - Create `mapped-types.md` with member-by-member mappings
   - Format: Markdown with type pair headings and member lists

### Java-to-Kotlin Mapping Tool

The project includes a tool (`map-java-to-kotlin.ts`) that maps Java type definitions to Kotlin equivalents:

- **Input**: Java type definition (source file or stdin)
- **Process**: 
  1. Parse Java definition to extract structure
  2. Convert to TypeScript d.ts format
  3. Apply type mappings (Java types → Kotlin types)
  4. Apply member mappings (getters → properties, etc.)
  5. Handle generic type parameters and nullability
- **Output**: d.ts file with Kotlin type names
- **Use cases**: Converting Java APIs to Kotlin-compatible TypeScript definitions

### Data Sources

- **Kotlin types**: Kotlin API Reference (`https://kotlinlang.org/api/core/kotlin-stdlib/`)
- **Java types**: Android Developer Documentation (`https://developer.android.com/reference/`)
- **Kotlin source**: GitHub (`https://github.com/JetBrains/kotlin`) via references from API docs
- **Type mappings**: Kotlin documentation (`https://kotlinlang.org/docs/java-interop.html`)

### Caching Strategy

All HTTP requests are automatically cached in `.cache/` directory using `make-fetch-happen`:
- Enables offline mode after initial fetch
- Speeds up repeated operations
- Cache directory is gitignored

### URL Generation Patterns

**Kotlin Types:**
```typescript
// kotlin.collections.MutableMap
// → https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-mutable-map/
```
Package and type names are kebab-cased with proper path structure.

**Java Types:**
```typescript
// java.util.Map
// → https://developer.android.com/reference/java/util/Map
```
Direct path mapping from package + type name.

## Development Workflow

1. Make changes to TypeScript source files in `lib/`
2. Run `npm run typecheck` to verify types
3. Run `npm test` to run tests
4. Test execution with individual commands (e.g., `npm run gen:defs -- --dry-run`)
5. Generated files go to `.defs/` and root directory (some are gitignored)
6. Commit source changes and generated documentation files

## Common Tasks

### Adding New CLI Command
1. Create new file in `lib/cli/` directory
2. Add script entry in `package.json` under `scripts`
3. Use existing utilities from `lib/` for common operations
4. Follow existing patterns for argument parsing and output

### Modifying Parsing Logic
- Java parsing: Edit `lib/get-java-def.ts`
- Kotlin parsing: Edit `lib/get-kotlin-def.ts`
- Mapping logic: Edit `lib/mappings.ts`
- Type transformation: Edit `lib/apply-type-mappings.ts`

### Updating Documentation
- Main README: `README.md` (English) and `README.zh-CN.md` (Chinese)
- Technical details: `TECHNICAL.md` (bilingual)
- Mapping tool: `MAPPER.md` (Chinese)
- Project status: `REMAINING_WORK.md`

### Testing
- Test files: `lib/*.test.ts`
- Run tests: `npm test` (runs type checking first, then tests via tsx)
- Tests use Node.js native test runner with TypeScript support via tsx loader

## What NOT to Do

- Don't commit files in `.cache/` directory - these are HTTP cache files
- Don't commit files in `.defs/` directory - these are generated type definitions
- Don't commit `node_modules/` or `dist/` directories
- Don't change Node.js version requirement (requires >= 24.0.0)
- Don't add build steps - the project uses native TypeScript execution
- Don't modify TypeScript strict mode settings

## Dependencies

When adding dependencies:
- Prefer minimal, well-maintained packages
- Check compatibility with Node.js 24+
- Add type definitions (`@types/*`) as devDependencies if needed
- Use `npm install` (updates package-lock.json)
- Production dependencies include `typescript` (used for AST manipulation, not just type checking)

## Key Files to Understand

- `lib/config.ts` - Path configuration using `import.meta.resolve`
- `lib/fetch-text.ts` - HTTP client wrapper with caching
- `lib/mappings.ts` - Core mapping logic and d.ts conversion
- `lib/apply-type-mappings.ts` - TypeScript AST transformation for type mappings
- `TECHNICAL.md` - Comprehensive technical documentation with examples
- `REMAINING_WORK.md` - Project status and planned improvements
