# Complete Workflow Example

This document provides a step-by-step example of the complete workflow.

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/hax/kotlin-java-mapped-types.git
cd kotlin-java-mapped-types

# Install dependencies
npm install
```

## Phase 1: Sync Data Sources

**Purpose:** Fetch and cache data from official documentation

```bash
# Run the sync script (requires internet access)
npm run sync
```

**What happens:**
1. Fetches https://kotlinlang.org/docs/java-interop.html
2. Extracts 32 type mappings to `resources/mapped-types.yaml`
3. For each mapping:
   - Fetches Kotlin type from https://kotlinlang.org/api/core/kotlin-stdlib/
   - Fetches Java type from https://developer.android.com/reference/
   - Caches to `resources/kotlin/` and `resources/java/`
4. Compares with existing cache and updates only changed files

**Output:**
```
=== Syncing Resources ===

Fetching Kotlin documentation...
✓ Kotlin documentation cached

Extracting mapped types from Kotlin documentation...
✓ Extracted and cached 32 mapped types

Fetching type definitions...
Fetching kotlin.Any...
  ✓ Cached kotlin_Any.kt
Fetching java.lang.Object...
  ✓ Cached java_lang_Object.java
...
(continues for all 32 types)

Summary:
  Kotlin definitions: 32 updated, 0 unchanged
  Java definitions: 32 updated, 0 unchanged

=== Sync Complete ===
```

**Result:** `resources/` directory now contains:
```
resources/
├── kotlin-doc.html
├── mapped-types.yaml
├── kotlin/
│   ├── kotlin_Any.kt
│   ├── kotlin_String.kt
│   ├── kotlin_Int.kt
│   └── ... (32 files total)
└── java/
    ├── java_lang_Object.java
    ├── java_lang_String.java
    ├── java_lang_Integer.java
    └── ... (32 files total)
```

## Phase 2: Generate Mappings

**Purpose:** Generate mapping details from cached data (works offline)

```bash
# Run the generate script (no internet required)
npm run generate
```

**What happens:**
1. Reads `resources/mapped-types.yaml`
2. For each mapping:
   - Reads cached Kotlin and Java definitions
   - Compares signatures
   - Generates mapping details
   - Saves to `mappings/<type_name>/`

**Output:**
```
Generating Kotlin-Java type mappings from cached resources...

Processing: kotlin.Any <-> java.lang.Object
  ✓ Generated definitions and mappings in kotlin_Any_to_java_lang_Object
Processing: kotlin.String <-> java.lang.String
  ✓ Generated definitions and mappings in kotlin_String_to_java_lang_String
Processing: kotlin.Int <-> java.lang.Integer
  ✓ Generated definitions and mappings in kotlin_Int_to_java_lang_Integer
...
(continues for all 32 types)

Done! Generated 32 type mappings.
```

**Result:** `mappings/` directory now contains:
```
mappings/
├── kotlin_Any_to_java_lang_Object/
│   ├── kotlin-definition.kt
│   ├── java-definition.java
│   └── mapping-details.yaml
├── kotlin_String_to_java_lang_String/
│   ├── kotlin-definition.kt
│   ├── java-definition.java
│   └── mapping-details.yaml
└── ... (32 directories total)
```

## Phase 3: Aggregate Results

**Purpose:** Create master YAML with all mappings

```bash
# Aggregate all mappings
npm run generate:mapped-types
```

**What happens:**
1. Scans all directories in `mappings/`
2. Extracts type info (kind and name) from each
3. Aggregates into master YAML file

**Output:**
```
Scanning mapping directories...
Found mapping: kotlin.Any (class) <-> java.lang.Object (class)
Found mapping: kotlin.String (class) <-> java.lang.String (class)
...
(continues for all 32 types)

Generated /path/to/mapped-types.yaml with 32 unique mappings
```

**Result:** `mapped-types.yaml` at project root:
```yaml
mappings:
  - kotlin:
      kind: class
      name: kotlin.Any
    java:
      kind: class
      name: java.lang.Object
  - kotlin:
      kind: class
      name: kotlin.String
    java:
      kind: class
      name: java.lang.String
  # ... (32 mappings total)
```

## Verification

```bash
# Verify everything works
./verify.sh
```

**Output:**
```
=== Testing Two-Phase Architecture ===

Test 1: Checking resources directory structure...
✅ Resources directory structure OK

Test 2: Checking for sample cached data...
✅ Found 32 cached Kotlin definitions
✅ Found 32 cached Java definitions

Test 3: Running TypeScript type checking...
✅ TypeScript type checking passed

Test 4: Testing generate from cached data...
✅ Generate script works with cached data
✅ Mapping details generated correctly

Test 5: Testing mapped-types.yaml aggregation...
✅ Aggregation script works

=== Verification Complete ===

Summary:
  ✅ Core architecture is working
  ✅ TypeScript code compiles correctly
  ✅ Generate phase works offline from cached data
```

## Example: Examining a Mapping

Let's look at the `kotlin.String` to `java.lang.String` mapping:

```bash
# View the Kotlin definition
cat mappings/kotlin_String_to_java_lang_String/kotlin-definition.kt
```

```kotlin
package kotlin

class String : Comparable<String>, CharSequence {
    override val length: Int
    override operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
    fun substring(startIndex: Int, endIndex: Int): String
    // ... more methods
}
```

```bash
# View the Java definition
cat mappings/kotlin_String_to_java_lang_String/java-definition.java
```

```java
package java.lang;

public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    public char charAt(int index);
    public int length();
    public String substring(int beginIndex);
    public String substring(int beginIndex, int endIndex);
    // ... more methods
}
```

```bash
# View the mapping details
cat mappings/kotlin_String_to_java_lang_String/mapping-details.yaml
```

```yaml
- kotlin: "override val length: Int"
  java: public int length()
- kotlin: "override operator fun get(index: Int): Char"
  java: public char charAt(int index)
- kotlin: "fun substring(startIndex: Int): String"
  java: public String substring(int beginIndex)
# ... more mappings
```

## Development Workflow

### Iterating on Generation Logic

```bash
# Make changes to lib/generate-mapping-details.ts
vim lib/generate-mapping-details.ts

# Test immediately (no network needed!)
npm run generate

# Check results
cat mappings/kotlin_String_to_java_lang_String/mapping-details.yaml
```

### Updating Data Sources

```bash
# Upstream APIs have changed, need to refresh cache
npm run sync

# Check what changed
git diff resources/

# Regenerate with new data
npm run generate
```

### Working Offline

```bash
# No internet? No problem!
# As long as resources/ is populated, you can:

npm run generate              # Generate mappings
npm run generate:mapped-types # Aggregate results
npm run typecheck            # Type check code
./verify.sh                  # Verify everything works
```

## Troubleshooting

### Error: "Resources not found"
```bash
# Solution: Run sync first
npm run sync
```

### Network errors during sync
```bash
# The sync script uses fallback data for mapped types list
# Individual type fetches may fail in restricted environments
# Run sync in an environment with internet access first
```

### Checking cache status
```bash
# Check number of cached definitions
ls resources/kotlin/ | wc -l  # Should be 32
ls resources/java/ | wc -l    # Should be 32

# Check mapped types list
wc -l resources/mapped-types.yaml  # Should be 32 entries
```

## Summary

The two-phase architecture enables:
1. **One-time sync** to populate cache (requires network)
2. **Unlimited offline generation** from cached data
3. **Fast iteration** during development
4. **Reproducible builds** across environments
