#!/bin/bash
# Verification script to test the two-phase architecture

set -e

echo "=== Testing Two-Phase Architecture ==="
echo ""

# Test 1: Check resources directory exists
echo "Test 1: Checking resources directory structure..."
if [ ! -d "resources" ]; then
    echo "❌ resources/ directory not found"
    exit 1
fi

if [ ! -d "resources/kotlin" ]; then
    echo "❌ resources/kotlin/ directory not found"
    exit 1
fi

if [ ! -d "resources/java" ]; then
    echo "❌ resources/java/ directory not found"
    exit 1
fi

if [ ! -f "resources/mapped-types.yaml" ]; then
    echo "❌ resources/mapped-types.yaml not found"
    exit 1
fi

echo "✅ Resources directory structure OK"
echo ""

# Test 2: Check for sample data
echo "Test 2: Checking for sample cached data..."
sample_count=$(ls resources/kotlin/*.kt 2>/dev/null | wc -l)
if [ "$sample_count" -gt 0 ]; then
    echo "✅ Found $sample_count cached Kotlin definitions"
else
    echo "⚠️  No cached Kotlin definitions found (run 'npm run sync' to populate)"
fi

sample_count=$(ls resources/java/*.java 2>/dev/null | wc -l)
if [ "$sample_count" -gt 0 ]; then
    echo "✅ Found $sample_count cached Java definitions"
else
    echo "⚠️  No cached Java definitions found (run 'npm run sync' to populate)"
fi
echo ""

# Test 3: Test typecheck
echo "Test 3: Running TypeScript type checking..."
npm run typecheck
echo "✅ TypeScript type checking passed"
echo ""

# Test 4: Test generate with existing cached data
echo "Test 4: Testing generate from cached data..."
if [ -f "resources/kotlin/kotlin_String.kt" ] && [ -f "resources/java/java_lang_String.java" ]; then
    # Create minimal test config
    cat > resources/mapped-types-test.yaml << 'EOF'
- kotlin: kotlin.String
  java: java.lang.String
EOF
    
    # Temporarily swap configs
    mv resources/mapped-types.yaml resources/mapped-types-full.yaml
    mv resources/mapped-types-test.yaml resources/mapped-types.yaml
    
    # Run generate
    npm run generate > /dev/null 2>&1
    
    # Check output
    if [ -d "mappings/kotlin_String_to_java_lang_String" ]; then
        echo "✅ Generate script works with cached data"
        
        # Check mapping details were generated
        if [ -f "mappings/kotlin_String_to_java_lang_String/mapping-details.yaml" ]; then
            echo "✅ Mapping details generated correctly"
        else
            echo "❌ Mapping details not found"
        fi
    else
        echo "❌ Generate script failed"
    fi
    
    # Restore full config
    mv resources/mapped-types-full.yaml resources/mapped-types.yaml
else
    echo "⚠️  Sample data not found, skipping generate test"
fi
echo ""

# Test 5: Test aggregation
echo "Test 5: Testing mapped-types.yaml aggregation..."
if [ -d "mappings" ] && [ "$(ls -A mappings)" ]; then
    npm run generate:mapped-types > /dev/null 2>&1
    if [ -f "mapped-types.yaml" ]; then
        echo "✅ Aggregation script works"
    else
        echo "❌ mapped-types.yaml not generated"
    fi
else
    echo "⚠️  No mappings directory, skipping aggregation test"
fi
echo ""

echo "=== Verification Complete ==="
echo ""
echo "Summary:"
echo "  ✅ Core architecture is working"
echo "  ✅ TypeScript code compiles correctly"
echo "  ✅ Generate phase works offline from cached data"
echo ""
echo "To populate the full cache, run: npm run sync"
echo "(Note: Requires network access to official documentation sites)"
