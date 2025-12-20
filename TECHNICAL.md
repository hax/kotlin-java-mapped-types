# Technical Documentation

## Architecture

This project uses a two-phase architecture that separates data fetching from mapping generation:

### Phase 1: Sync (`npm run sync`)
Fetches raw HTML pages from official documentation and caches them locally with intelligent HTTP caching.

**Process:**
1. Downloads Kotlin interop documentation from kotlinlang.org
2. Extracts the 32 type mapping pairs
3. For each type pair:
   - Fetches raw HTML page for Kotlin type from kotlinlang.org/api/core/kotlin-stdlib/
   - Fetches raw HTML page for Java type from developer.android.com/reference/
4. Caches all fetched HTML in `resources/` directory without parsing
5. Uses RFC 7234 compliant HTTP caching with If-Modified-Since and ETag headers
6. Only re-downloads resources that have changed on the remote servers

**HTTP Caching:**
The sync phase uses [`make-fetch-happen`](https://github.com/npm/make-fetch-happen) for intelligent HTTP caching:
- Automatically sends If-Modified-Since and ETag headers with requests
- Caches responses in disk storage (system temp directory by default)
- Validates cached responses with remote servers
- Only downloads full content when resources have changed
- Includes automatic retry logic for transient network failures
- RFC 7234 compliant caching semantics

**Output:**
- `resources/mapped-types.yaml` - List of 32 type mappings
- `resources/kotlin/*.html` - Raw HTML pages from Kotlin documentation (29 files)
- `resources/java/*.html` - Raw HTML pages from Android documentation (23 files)

### Phase 2: Generate (`npm run generate`)
Parses cached HTML and generates mapping details without requiring network access.

**Process:**
1. Reads `resources/mapped-types.yaml` for the list of type mappings
2. For each mapping:
   - Loads cached HTML pages for Kotlin and Java types
   - Parses HTML to extract type definitions and signatures
   - Matches signatures between languages
   - Generates mapping details
3. Creates directory structure under `mappings/`
4. Aggregates all mappings into master `mapped-types.yaml`

**Output:**
- `mappings/<type>_to_<type>/` directories containing:
  - `kotlin-definition.kt` - Parsed Kotlin type with signatures
  - `java-definition.java` - Parsed Java type with signatures
  - `mapping-details.yaml` - Signature-to-signature mappings
- `mapped-types.yaml` - Master aggregated mapping file

## Benefits

**Offline Development:**
- After initial sync, all generation can happen offline
- No repeated network calls during development
- Faster iteration cycles

**Reproducibility:**
- Cached data ensures consistent results across environments
- Version control tracks changes to upstream APIs
- Easy to reproduce builds

**HTTP Caching Benefits:**
- Intelligent caching avoids re-downloading unchanged resources
- Dramatically reduces sync time on subsequent runs
- Respects server cache headers (If-Modified-Since, ETag)
- Automatic validation of cached content
- Built-in retry logic for network reliability

**Separation of Concerns:**
- Data fetching stores only raw HTML (original source material)
- Parsing and processing happen during generation
- Easier to test and maintain
- Clear boundaries between phases
- Version control can track upstream changes via HTML diffs

## Data Format

### resources/mapped-types.yaml
Simple list of type mapping pairs:
```yaml
- kotlin: kotlin.String
  java: java.lang.String
- kotlin: kotlin.Int
  java: java.lang.Integer
# ... 30 more mappings
```

### resources/kotlin/*.html
Raw HTML pages from Kotlin API documentation. These are the complete, unmodified HTML pages as fetched from kotlinlang.org, containing:
- Full page structure with navigation, headers, and styling
- Type declarations and inheritance information
- Property and function signatures with documentation
- Code examples and usage information

Example URL: `https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/`

The HTML is parsed during the generate phase to extract structured type definitions.

### resources/java/*.html
Raw HTML pages from Android API documentation. These are the complete, unmodified HTML pages as fetched from developer.android.com, containing:
- Full page structure with navigation, headers, and styling
- Class/interface declarations
- Method signatures with documentation
- Code examples and usage information

Example URL: `https://developer.android.com/reference/java/lang/String`

The HTML is parsed during the generate phase to extract structured type definitions.

public final class String implements Comparable<String>, CharSequence {
    @Override
    public int length();
    @Override
    public char charAt(int index);
    public String substring(int beginIndex);
    // ... more methods
}
```

### mappings/.../mapping-details.yaml
Signature-to-signature mappings:
```yaml
- kotlin: "override val length: Int"
  java: public int length()
- kotlin: "override operator fun get(index: Int): Char"
  java: public char charAt(int index)
# ... more mappings
```

## Implementation Notes

**HTTP Caching:**
- Uses `make-fetch-happen` library for RFC 7234 compliant HTTP caching
- Unified caching logic in `lib/http-cache.ts` module
- Eliminates code duplication across fetch functions
- Cache stored in system temp directory (`/tmp/kotlin-java-mapped-types-cache/`)
- All HTTP requests go through the centralized caching layer
- Supports cache clearing via exported `clearCache()` function

**File Naming Convention:**
- Kotlin HTML files: `kotlin_<Type>.html` (dots replaced with underscores)
- Java HTML files: `java_<package>_<Type>.html` (dots replaced with underscores)
- Generated Kotlin files: `kotlin-definition.kt` in mapping directories
- Generated Java files: `java-definition.java` in mapping directories
- Example: `kotlin.collections.List` → cached as `kotlin_collections_List.html`

**Signature Matching:**
The generate phase matches signatures using:
- Direct name matching (e.g., `toString` → `toString`)
- Property to getter (e.g., Kotlin `length` → Java `length()`)
- Special cases (e.g., Kotlin `get(index)` → Java `charAt(index)`)

**@Override Annotations:**
Java definitions include `@Override` annotations when:
- The method is detected as overriding a parent class or interface method in the Android documentation
- The annotation is parsed from the original HTML source
- This preserves the semantic information about method inheritance

**Error Handling:**
- Sync phase: Falls back to predefined list if documentation fetch fails
- Generate phase: Exits with error if resources directory is missing
- Both phases: Logs errors for individual type failures but continues processing

## Requirements

- Node.js >= 22.0.0 (for native TypeScript support via --experimental-strip-types)
- Network access for sync phase
- Write permissions for resources and mappings directories
