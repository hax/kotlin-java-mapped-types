# Resources Directory

This directory contains cached data sources fetched from official Kotlin and Java/Android documentation.

## Purpose

The resources directory serves as a cache layer, enabling:
- **Offline development**: Generate mappings without network access
- **Reproducibility**: Consistent results across different environments
- **Version control**: Track changes to upstream APIs
- **Performance**: Avoid repeated network calls during development

## Structure

```
resources/
├── kotlin-doc.html          # Cached Kotlin interop documentation page
├── mapped-types.yaml        # List of all 32 Kotlin-Java type mappings
├── kotlin/                  # Cached Kotlin type definitions
│   ├── kotlin_Any.kt
│   ├── kotlin_String.kt
│   ├── kotlin_Int.kt
│   └── ...                  # One file per Kotlin type
└── java/                    # Cached Java type definitions
    ├── java_lang_Object.java
    ├── java_lang_String.java
    ├── java_lang_Integer.java
    └── ...                  # One file per Java type
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

### kotlin/*.kt
Kotlin type definition files with complete signatures. Each file contains:
- Package declaration
- Class/interface declaration with inheritance
- Property signatures (val/var)
- Function signatures with parameters and return types

Example: `kotlin_String.kt`
```kotlin
package kotlin

class String : Comparable<String>, CharSequence {
    override val length: Int
    override operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
    // ...
}
```

### java/*.java
Java type definition files with complete signatures. Each file contains:
- Package declaration
- Class/interface declaration with inheritance
- Method signatures with modifiers, return types, and parameters

Example: `java_lang_String.java`
```java
package java.lang;

public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    public char charAt(int index);
    public int length();
    public String substring(int beginIndex);
    // ...
}
```

## Updating Resources

To update cached data sources, run:
```bash
npm run sync
```

This will:
1. Fetch the latest Kotlin documentation
2. Extract the current mapped types list
3. Fetch type definitions for all types
4. Compare with existing cached files
5. Update only changed files

## Note

Sample files are included for demonstration purposes. Run `npm run sync` to populate the full cache with all 32 type mappings.
