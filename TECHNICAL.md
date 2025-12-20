# Technical Documentation

## Architecture

This project uses a two-phase architecture that separates data fetching from mapping generation:

### Phase 1: Sync (`npm run sync`)
Fetches type information from official documentation and caches it locally.

**Process:**
1. Downloads Kotlin interop documentation from kotlinlang.org
2. Extracts the 32 type mapping pairs
3. For each type pair:
   - Fetches Kotlin type definition from kotlinlang.org/api/core/kotlin-stdlib/
   - Fetches Java type definition from developer.android.com/reference/
4. Caches all fetched data in `resources/` directory
5. Uses smart comparison - only updates files that have changed

**Output:**
- `resources/mapped-types.yaml` - List of 32 type mappings
- `resources/kotlin/*.kt` - Kotlin type definitions (one file per type)
- `resources/java/*.java` - Java type definitions (one file per type)

### Phase 2: Generate (`npm run generate`)
Generates mapping details from cached data without requiring network access.

**Process:**
1. Reads `resources/mapped-types.yaml` for the list of type mappings
2. For each mapping:
   - Loads cached Kotlin and Java definitions
   - Parses both definitions to extract signatures
   - Matches signatures between languages
   - Generates mapping details
3. Creates directory structure under `mappings/`
4. Aggregates all mappings into master `mapped-types.yaml`

**Output:**
- `mappings/<type>_to_<type>/` directories containing:
  - `kotlin-definition.kt` - Kotlin type with signatures
  - `java-definition.java` - Java type with signatures
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

**Separation of Concerns:**
- Data fetching logic separated from generation logic
- Easier to test and maintain
- Clear boundaries between phases

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

### resources/kotlin/*.kt
Kotlin type definitions with complete signatures:
```kotlin
package kotlin

class String : Comparable<String>, CharSequence {
    override val length: Int
    override operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
    // ... more methods
}
```

### resources/java/*.java
Java type definitions with complete signatures:
```java
package java.lang;

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

**File Naming Convention:**
- Kotlin files: `kotlin_<Type>.kt` (dots replaced with underscores)
- Java files: `java_<package>_<Type>.java` (dots replaced with underscores)
- Example: `kotlin.collections.List` → `kotlin_collections_List.kt`

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
