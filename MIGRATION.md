# Migration Guide

## Changes in the Two-Phase Architecture

The project has been refactored to separate data fetching from data processing, introducing a two-phase workflow.

### What Changed?

**Before:**
- `npm run generate` - Fetched from network and generated mappings in one step

**After:**
- `npm run sync` - Fetches from network and caches data (run once or when updating)
- `npm run generate` - Generates mappings from cached data (works offline)

### Migration Steps

1. **First-time setup or when updating data sources:**
   ```bash
   npm install  # Install new tsx dependency
   npm run sync  # Fetch and cache data from official docs
   ```

2. **Generate mappings (can be done offline):**
   ```bash
   npm run generate
   ```

### Benefits

- **Offline capability**: After initial sync, you can generate mappings without internet
- **Faster iteration**: No need to fetch from network on every generation
- **Reproducibility**: Cached data ensures consistent results
- **Version control**: Changes to upstream APIs are visible in git diffs

### Backward Compatibility

The old all-in-one script is preserved as `lib/generate-all-legacy.ts` for reference, but is no longer used by the npm scripts.

### Troubleshooting

**Error: "Resources not found"**
- Solution: Run `npm run sync` first to fetch and cache the data sources

**Network errors during sync**
- This is expected in environments without network access
- The sync script uses fallback data for mapped types list
- You may need to run sync in an environment with network access first

### Directory Structure

New directory: `resources/`
- `resources/kotlin-doc.html` - Cached Kotlin documentation
- `resources/mapped-types.yaml` - List of mapped types
- `resources/kotlin/` - Cached Kotlin type definitions
- `resources/java/` - Cached Java type definitions

The `mappings/` directory structure remains unchanged.
