# Remaining Work from PR #27

## Completed ✓
- [x] Fixed test quality - tests now verify entire output string
- [x] Removed `unmappedTypes` tracking
- [x] Added node paths to `appliedMappings` for better testability  
- [x] Fixed config.ts path resolution issues
- [x] Fixed regex duplicate capture group bug in mappings.ts
- [x] Successfully generating mapped-types.json with member mappings
- [x] Type-level mappings working (e.g., `Map` → `kotlin.collections.MutableMap`)
- [x] All tests passing (8/8)

## Known Issues in Generated Data ⚠️

The `mapped-types.json` file has some incorrect member mappings (identified by code review):
- Map.Entry interface incorrectly includes entrySet, keySet, size, values methods (these belong to Map)
- ListIterator incorrectly shows size method
- Spacing inconsistency in generic types (K,V vs K, V)

**Root Cause**: These are bugs in either:
1. The `calcMapping()` function in `mappings.ts`
2. The source definition files in `.defs/` directory  
3. The definition extraction logic

**Note**: These issues were pre-existing and not introduced by the current changes. They should be fixed in a separate PR focused on the generation logic.

## Remaining Tasks 🚧

### 1. Member Mapping with Supertype Checking

**Goal**: Apply member-level transformations when a type inherits from a mapped type.

**Example**: 
```typescript
// Input d.ts
interface CustomMap<K, V> extends Map<K, V> {
  size(): number;
  keySet(): Set<K>;
}

// Expected output (with member mappings applied)
interface CustomMap<K, V> extends kotlin.collections.MutableMap<K, V> {
  size: kotlin.Int;      // method → property
  keys: Set<K>;          // keySet() → keys property
}
```

**What needs to be done**:
1. Parse method signatures from TypeScript AST
2. Track type hierarchies (extends/implements)
3. Load member mappings from `mapped-types.json`
4. Match method signatures against member mappings:
   - If type extends/implements a mapped type (e.g., `Map`)
   - And has methods that match member mappings
   - Then apply those transformations
5. Transform AST:
   - Convert method declarations to property declarations
   - Update signatures according to mappings
   - Apply name changes (e.g., `keySet` → `keys`)

**Complexity**: High
- Requires matching method signatures with generic type support
- Needs type hierarchy resolution
- Complex AST transformations (method → property)

### 2. Handle get/setXXX → Property Conversion

**Goal**: Automatically convert Java-style getters/setters to properties.

**Example**:
```typescript
// Input d.ts
interface Person {
  getName(): String;
  setName(name: String): void;
  getAge(): int;
}

// Expected output
interface Person {
  name: kotlin.String;
  age: kotlin.Int;
}
```

**What needs to be done**:
1. Detect get/set method patterns:
   - `getXxx()` → property `xxx`
   - `setXxx(value)` → property setter
   - `isXxx()` → boolean property `xxx`
2. Pair getters with setters
3. Transform to property declarations
4. Determine property mutability (val/var)

**Complexity**: Medium
- Method pattern detection
- Getter/setter pairing logic
- Property mutability inference

## Implementation Notes

### Data Available
- `mapped-types.json` contains all member mappings with signatures
- Example structure:
```json
{
  "javaType": "java.util.Map<K, V>",
  "kotlinType": "kotlin.collections.MutableMap<K, V>",
  "members": [
    {
      "javaName": "keySet",
      "javaSignature": "public abstract keySet(): Set<K>",
      "kotlinName": "keys",
      "kotlinSignature": "public keys: Set<K>"
    }
  ]
}
```

### Current Architecture
- `apply-type-mappings.ts`: Handles type-level replacements only
- `map-java-to-kotlin.ts`: Orchestrates the mapping process
- `mappings.ts`: Has `calcMapping()` that computes member mappings

### Suggested Approach
1. Create `apply-member-mappings.ts` for member-level transformations
2. Load mappings from `mapped-types.json`
3. Implement signature matching logic
4. Implement AST transformation (method → property)
5. Add comprehensive tests

### Testing Strategy
- Start with simple cases (direct Map usage)
- Add tests for inheritance scenarios
- Test generic type preservation
- Test getter/setter conversion
- Test edge cases (overloads, static methods, etc.)

## References
- Original PR: https://github.com/hax/kotlin-java-mapped-types/pull/27
- Unresolved comment (r2643802137): Explains member mapping with supertype checking requirement
- Kotlin interop docs: https://kotlinlang.org/docs/java-interop.html#mapped-types
