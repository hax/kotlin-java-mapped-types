# Technical Documentation

## Architecture

This project uses a two-phase architecture that separates data fetching from mapping generation:

### Phase 1: Sync (`npm run sync`)
Fetches raw HTML pages from official documentation and caches them locally.

**Process:**
1. Downloads Kotlin interop documentation from kotlinlang.org
2. Extracts the 32 type mapping pairs
3. For each type pair:
   - Fetches raw HTML page for Kotlin type from kotlinlang.org/api/core/kotlin-stdlib/
   - Fetches raw HTML page for Java type from developer.android.com/reference/
4. Caches all fetched HTML in `doc-cache/` directory using HTTP caching
5. Uses `--offline` flag to validate cache without network

**Output:**
- `mapped-types.yaml` - List of 32 type mappings
- `doc-cache/` - HTTP cache of HTML pages

### Phase 2: Generate (`npm run generate`)
Parses cached HTML and generates mapping details without requiring network access.

**Process:**
1. Reads `mapped-types.yaml` for the list of type mappings
2. For each mapping:
   - Loads cached HTML pages for Kotlin and Java types
   - Extracts signatures directly from HTML (no complex parsing)
     - Java: `.api-signature` elements
     - Kotlin: signature code blocks
   - Generates definition files with source URL headers
3. Creates directory structure under `mappings/`
4. Generates `mapped-types-details.yaml` by parsing definitions and matching signatures

**Output:**
- `mappings/<type>_to_<type>/` directories containing:
  - `kotlin-definition.kt` - Kotlin type with signatures and source URL
  - `java-definition.java` - Java type with signatures and source URL
- `mapped-types-details.yaml` - Master file with simplified mappings

## Benefits

**Offline Development:**
- After initial sync, all generation can happen offline
- No repeated network calls during development
- Faster iteration cycles

**Reproducibility:**
- Cached data ensures consistent results across environments
- Version control tracks changes to upstream APIs
- Easy to reproduce builds

**Separation of Concerns:**
- Data fetching stores only raw HTML (original source material)
- Parsing and processing happen during generation
- Clear boundaries between phases

## Data Format

### mapped-types.yaml
Simple list of type mapping pairs:
```yaml
- kotlin: kotlin.String
  java: java.lang.String
- kotlin: kotlin.Int
  java: java.lang.Integer
# ... 30 more mappings
```

### doc-cache/
HTTP cache directory containing raw HTML pages from official documentation.

### Generated Definitions
Each definition file includes:
- Source URL header (e.g., `// Source: https://...`)
- Package declaration
- Class/interface declaration
- Method/property signatures extracted directly from HTML

Example Java definition:
```java
// Source: https://developer.android.com/reference/java/lang/String

package java.lang;

public final class String {
    public int length();
    public char charAt(int index);
    public String substring(int beginIndex);
}
```

Example Kotlin definition:
```kotlin
// Source: https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
}
```

## Implementation Notes

**URL Conversion:**
- `typeNameToKotlinUrl()` and `typeNameToJavaUrl()` in `utils.ts`
- Handles nested types (e.g., `Map.Entry`)
- Converts package.Class to appropriate URL format

**Signature Extraction:**
- Java: Direct extraction from `.api-signature` HTML elements
- Kotlin: Direct extraction from signature code blocks
- Minimal parsing, preserves original formatting

**Signature Matching:**
- Direct name matching (e.g., `toString` → `toString`)
- Property to getter (e.g., Kotlin `length` → Java `length()`)
- Special cases (e.g., Kotlin `get(index)` → Java `charAt(index)`)

**Error Handling:**
- Sync phase: Reports fetch failures, continues processing
- Generate phase: Reports processing failures, continues with remaining types
- Both phases log errors but don't halt execution

## Requirements

- Node.js >= 24.0.0 (for native TypeScript support)
- Network access for sync phase
- Write permissions for doc-cache and mappings directories
