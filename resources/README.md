# Resources Directory

This directory contains cached raw HTML pages from official Kotlin and Java/Android documentation.

## Purpose

The resources directory serves as a cache layer for original documentation, enabling:
- **Offline development**: Generate mappings without network access after initial sync
- **Reproducibility**: Consistent results across different environments
- **Version control**: Track changes to upstream APIs by comparing HTML diffs
- **Performance**: Avoid repeated network calls during development
- **Data integrity**: Store original source material without parsing

## Structure

```
resources/
├── kotlin-doc.html          # Cached Kotlin interop documentation page
├── mapped-types.yaml        # List of all 32 Kotlin-Java type mappings
├── kotlin/                  # Cached Kotlin type documentation pages (raw HTML)
│   ├── kotlin_Any.html
│   ├── kotlin_String.html
│   ├── kotlin_Int.html
│   └── ...                  # One HTML file per Kotlin type (29 files)
└── java/                    # Cached Java type documentation pages (raw HTML)
    ├── java_lang_Object.html
    ├── java_lang_String.html
    ├── java_lang_Integer.html
    └── ...                  # One HTML file per Java type (23 files)
```

## Files

### kotlin-doc.html
The complete HTML of the Kotlin Java interoperability documentation page, specifically the section containing the mapped types table.

Source: https://kotlinlang.org/docs/java-interop.html

### mapped-types.yaml
A YAML array listing all 32 type mappings between Kotlin and Java. Format:
```yaml
- kotlin: kotlin.String
  java: java.lang.String
- kotlin: kotlin.Int
  java: java.lang.Integer
# ... 30 more mappings
```

### kotlin/*.html
Raw HTML pages from Kotlin API documentation for each mapped type. These are the original documentation pages as fetched from kotlinlang.org, containing:
- Type declarations
- Property and function signatures
- Documentation and examples
- All HTML structure and styling

Example source: `https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/`

The HTML files are parsed during the generate phase to extract type definitions.

### java/*.html
Raw HTML pages from Android API documentation for each mapped type. These are the original documentation pages as fetched from developer.android.com, containing:
- Class/interface declarations
- Method signatures
- Documentation and examples
- All HTML structure and styling

Example source: `https://developer.android.com/reference/java/lang/String`

The HTML files are parsed during the generate phase to extract type definitions.

## Updating Resources

To update cached data sources, run:
```bash
npm run sync
```

This will:
1. Fetch the latest Kotlin documentation page
2. Extract the current mapped types list to YAML
3. Fetch raw HTML pages for all Kotlin types
4. Fetch raw HTML pages for all Java types
5. Compare with existing cached files
6. Update only changed files

## Architecture

The two-phase architecture separates concerns:

**Sync Phase** (`npm run sync`):
- Fetches and caches raw HTML from official documentation
- No parsing or processing - just stores original pages
- Requires network access to kotlinlang.org and developer.android.com

**Generate Phase** (`npm run generate`):
- Reads cached HTML files from resources/
- Parses HTML to extract type definitions
- Generates mapping files
- Works completely offline after sync

This separation ensures that the resources directory contains only original source material, making it easier to track upstream changes and maintain data integrity.
