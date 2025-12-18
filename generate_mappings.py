#!/usr/bin/env python3
"""
Generate directory structure and mapping files for Kotlin-Java mapped types.
"""

import os
import yaml
from pathlib import Path

# Known type definitions and their members
TYPE_DEFINITIONS = {
    # Java types
    'java.lang.Object': {
        'type': 'class',
        'methods': ['equals', 'hashCode', 'toString', 'getClass', 'notify', 'notifyAll', 'wait'],
        'is_interface': False
    },
    'java.lang.Byte': {
        'type': 'class',
        'methods': ['byteValue', 'compareTo', 'equals', 'hashCode', 'toString'],
        'extends': 'java.lang.Number',
        'is_interface': False
    },
    'java.lang.Short': {
        'type': 'class',
        'methods': ['shortValue', 'compareTo', 'equals', 'hashCode', 'toString'],
        'extends': 'java.lang.Number',
        'is_interface': False
    },
    'java.lang.Integer': {
        'type': 'class',
        'methods': ['intValue', 'compareTo', 'equals', 'hashCode', 'toString'],
        'extends': 'java.lang.Number',
        'is_interface': False
    },
    'java.lang.Long': {
        'type': 'class',
        'methods': ['longValue', 'compareTo', 'equals', 'hashCode', 'toString'],
        'extends': 'java.lang.Number',
        'is_interface': False
    },
    'java.lang.Character': {
        'type': 'class',
        'methods': ['charValue', 'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'java.lang.Float': {
        'type': 'class',
        'methods': ['floatValue', 'compareTo', 'equals', 'hashCode', 'toString', 'isNaN', 'isInfinite'],
        'extends': 'java.lang.Number',
        'is_interface': False
    },
    'java.lang.Double': {
        'type': 'class',
        'methods': ['doubleValue', 'compareTo', 'equals', 'hashCode', 'toString', 'isNaN', 'isInfinite'],
        'extends': 'java.lang.Number',
        'is_interface': False
    },
    'java.lang.Boolean': {
        'type': 'class',
        'methods': ['booleanValue', 'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'java.lang.String': {
        'type': 'class',
        'methods': ['charAt', 'compareTo', 'concat', 'contains', 'equals', 'equalsIgnoreCase', 
                   'hashCode', 'indexOf', 'isEmpty', 'length', 'replace', 'split', 
                   'startsWith', 'substring', 'toLowerCase', 'toUpperCase', 'trim', 'toString'],
        'is_interface': False
    },
    'java.lang.CharSequence': {
        'type': 'interface',
        'methods': ['charAt', 'length', 'subSequence', 'toString'],
        'is_interface': True
    },
    'java.lang.Throwable': {
        'type': 'class',
        'methods': ['getMessage', 'getLocalizedMessage', 'getCause', 'printStackTrace', 
                   'getStackTrace', 'toString'],
        'is_interface': False
    },
    'java.lang.Cloneable': {
        'type': 'interface',
        'methods': [],
        'is_interface': True
    },
    'java.lang.Comparable': {
        'type': 'interface',
        'methods': ['compareTo'],
        'is_interface': True
    },
    'java.lang.Enum': {
        'type': 'class',
        'methods': ['name', 'ordinal', 'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'java.lang.annotation.Annotation': {
        'type': 'interface',
        'methods': ['annotationType', 'equals', 'hashCode', 'toString'],
        'is_interface': True
    },
    'java.util.Iterator': {
        'type': 'interface',
        'methods': ['hasNext', 'next', 'remove'],
        'is_interface': True
    },
    'java.lang.Iterable': {
        'type': 'interface',
        'methods': ['iterator'],
        'is_interface': True
    },
    'java.util.Collection': {
        'type': 'interface',
        'methods': ['add', 'addAll', 'clear', 'contains', 'containsAll', 'equals', 
                   'hashCode', 'isEmpty', 'iterator', 'remove', 'removeAll', 
                   'retainAll', 'size', 'toArray'],
        'extends': 'java.lang.Iterable',
        'is_interface': True
    },
    'java.util.Set': {
        'type': 'interface',
        'methods': ['add', 'addAll', 'clear', 'contains', 'containsAll', 'equals', 
                   'hashCode', 'isEmpty', 'iterator', 'remove', 'removeAll', 
                   'retainAll', 'size', 'toArray'],
        'extends': 'java.util.Collection',
        'is_interface': True
    },
    'java.util.List': {
        'type': 'interface',
        'methods': ['add', 'addAll', 'clear', 'contains', 'containsAll', 'equals', 
                   'get', 'hashCode', 'indexOf', 'isEmpty', 'iterator', 'lastIndexOf',
                   'listIterator', 'remove', 'removeAll', 'retainAll', 'set', 
                   'size', 'subList', 'toArray'],
        'extends': 'java.util.Collection',
        'is_interface': True
    },
    'java.util.ListIterator': {
        'type': 'interface',
        'methods': ['hasNext', 'hasPrevious', 'next', 'nextIndex', 'previous', 
                   'previousIndex', 'remove', 'set', 'add'],
        'extends': 'java.util.Iterator',
        'is_interface': True
    },
    'java.util.Map': {
        'type': 'interface',
        'methods': ['clear', 'containsKey', 'containsValue', 'entrySet', 'equals', 
                   'get', 'hashCode', 'isEmpty', 'keySet', 'put', 'putAll', 
                   'remove', 'size', 'values'],
        'is_interface': True
    },
    'java.util.Map.Entry': {
        'type': 'interface',
        'methods': ['getKey', 'getValue', 'setValue', 'equals', 'hashCode'],
        'is_interface': True
    },
    
    # Kotlin types
    'kotlin.Any': {
        'type': 'class',
        'methods': ['equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Byte': {
        'type': 'class',
        'methods': ['toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble', 'toChar',
                   'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Short': {
        'type': 'class',
        'methods': ['toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble', 'toChar',
                   'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Int': {
        'type': 'class',
        'methods': ['toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble', 'toChar',
                   'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Long': {
        'type': 'class',
        'methods': ['toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble', 'toChar',
                   'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Char': {
        'type': 'class',
        'methods': ['toChar', 'toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble',
                   'compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Float': {
        'type': 'class',
        'methods': ['toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble', 
                   'compareTo', 'equals', 'hashCode', 'toString', 'isNaN', 'isInfinite'],
        'is_interface': False
    },
    'kotlin.Double': {
        'type': 'class',
        'methods': ['toByte', 'toShort', 'toInt', 'toLong', 'toFloat', 'toDouble',
                   'compareTo', 'equals', 'hashCode', 'toString', 'isNaN', 'isInfinite'],
        'is_interface': False
    },
    'kotlin.Boolean': {
        'type': 'class',
        'methods': ['compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.String': {
        'type': 'class',
        'properties': ['length'],
        'methods': ['get', 'compareTo', 'equals', 'hashCode', 'toString', 'substring',
                   'startsWith', 'endsWith', 'indexOf', 'lastIndexOf', 'contains',
                   'replace', 'toLowerCase', 'toUpperCase', 'trim', 'split'],
        'is_interface': False
    },
    'kotlin.CharSequence': {
        'type': 'interface',
        'properties': ['length'],
        'methods': ['get', 'subSequence', 'toString'],
        'is_interface': True
    },
    'kotlin.Throwable': {
        'type': 'class',
        'properties': ['message', 'cause', 'stackTrace'],
        'methods': ['printStackTrace', 'toString'],
        'is_interface': False
    },
    'kotlin.Cloneable': {
        'type': 'interface',
        'methods': [],
        'is_interface': True
    },
    'kotlin.Comparable': {
        'type': 'interface',
        'methods': ['compareTo'],
        'is_interface': True
    },
    'kotlin.Enum': {
        'type': 'class',
        'properties': ['name', 'ordinal'],
        'methods': ['compareTo', 'equals', 'hashCode', 'toString'],
        'is_interface': False
    },
    'kotlin.Annotation': {
        'type': 'interface',
        'methods': [],
        'is_interface': True
    },
    'kotlin.collections.Iterator': {
        'type': 'interface',
        'methods': ['hasNext', 'next'],
        'is_interface': True
    },
    'kotlin.collections.Iterable': {
        'type': 'interface',
        'methods': ['iterator'],
        'is_interface': True
    },
    'kotlin.collections.Collection': {
        'type': 'interface',
        'properties': ['size'],
        'methods': ['contains', 'containsAll', 'isEmpty', 'iterator'],
        'extends': 'kotlin.collections.Iterable',
        'is_interface': True
    },
    'kotlin.collections.Set': {
        'type': 'interface',
        'properties': ['size'],
        'methods': ['contains', 'containsAll', 'isEmpty', 'iterator'],
        'extends': 'kotlin.collections.Collection',
        'is_interface': True
    },
    'kotlin.collections.List': {
        'type': 'interface',
        'properties': ['size'],
        'methods': ['contains', 'containsAll', 'get', 'indexOf', 'isEmpty', 
                   'iterator', 'lastIndexOf', 'listIterator', 'subList'],
        'extends': 'kotlin.collections.Collection',
        'is_interface': True
    },
    'kotlin.collections.ListIterator': {
        'type': 'interface',
        'methods': ['hasNext', 'hasPrevious', 'next', 'nextIndex', 'previous', 'previousIndex'],
        'extends': 'kotlin.collections.Iterator',
        'is_interface': True
    },
    'kotlin.collections.Map': {
        'type': 'interface',
        'properties': ['size', 'entries', 'keys', 'values'],
        'methods': ['containsKey', 'containsValue', 'get', 'isEmpty'],
        'is_interface': True
    },
    'kotlin.collections.Map.Entry': {
        'type': 'interface',
        'properties': ['key', 'value'],
        'methods': [],
        'is_interface': True
    },
    'kotlin.collections.MutableIterator': {
        'type': 'interface',
        'methods': ['hasNext', 'next', 'remove'],
        'extends': 'kotlin.collections.Iterator',
        'is_interface': True
    },
    'kotlin.collections.MutableIterable': {
        'type': 'interface',
        'methods': ['iterator'],
        'extends': 'kotlin.collections.Iterable',
        'is_interface': True
    },
    'kotlin.collections.MutableCollection': {
        'type': 'interface',
        'properties': ['size'],
        'methods': ['add', 'addAll', 'clear', 'contains', 'containsAll', 
                   'isEmpty', 'iterator', 'remove', 'removeAll', 'retainAll'],
        'extends': 'kotlin.collections.Collection',
        'is_interface': True
    },
    'kotlin.collections.MutableSet': {
        'type': 'interface',
        'properties': ['size'],
        'methods': ['add', 'addAll', 'clear', 'contains', 'containsAll', 
                   'isEmpty', 'iterator', 'remove', 'removeAll', 'retainAll'],
        'extends': 'kotlin.collections.MutableCollection',
        'is_interface': True
    },
    'kotlin.collections.MutableList': {
        'type': 'interface',
        'properties': ['size'],
        'methods': ['add', 'addAll', 'clear', 'contains', 'containsAll', 'get', 
                   'indexOf', 'isEmpty', 'iterator', 'lastIndexOf', 'listIterator',
                   'remove', 'removeAll', 'removeAt', 'retainAll', 'set', 'subList'],
        'extends': 'kotlin.collections.MutableCollection',
        'is_interface': True
    },
    'kotlin.collections.MutableListIterator': {
        'type': 'interface',
        'methods': ['add', 'hasNext', 'hasPrevious', 'next', 'nextIndex', 
                   'previous', 'previousIndex', 'remove', 'set'],
        'extends': 'kotlin.collections.ListIterator',
        'is_interface': True
    },
    'kotlin.collections.MutableMap': {
        'type': 'interface',
        'properties': ['size', 'entries', 'keys', 'values'],
        'methods': ['clear', 'containsKey', 'containsValue', 'get', 'isEmpty', 
                   'put', 'putAll', 'remove'],
        'is_interface': True
    },
    'kotlin.collections.MutableMap.MutableEntry': {
        'type': 'interface',
        'properties': ['key', 'value'],
        'methods': ['setValue'],
        'extends': 'kotlin.collections.Map.Entry',
        'is_interface': True
    },
}


def sanitize_dir_name(type_name):
    """Convert type name to a safe directory name."""
    return type_name.replace('.', '_').replace('$', '_')


def generate_java_definition(java_type, definition):
    """Generate Java type definition content."""
    lines = []
    package = '.'.join(java_type.split('.')[:-1])
    class_name = java_type.split('.')[-1]
    
    if package:
        lines.append(f"package {package};")
        lines.append("")
    
    keyword = "interface" if definition.get('is_interface') else "class"
    extends = definition.get('extends', '')
    extends_clause = f" extends {extends}" if extends else ""
    
    lines.append(f"public {keyword} {class_name}{extends_clause} {{")
    
    # Add methods
    for method in definition.get('methods', []):
        lines.append(f"    // {method}()")
    
    lines.append("}")
    
    return '\n'.join(lines)


def generate_kotlin_definition(kotlin_type, definition):
    """Generate Kotlin type definition content."""
    lines = []
    package = '.'.join(kotlin_type.rsplit('.', 1)[:-1]) if '.' in kotlin_type else ''
    class_name = kotlin_type.rsplit('.', 1)[-1]
    
    if package:
        lines.append(f"package {package}")
        lines.append("")
    
    keyword = "interface" if definition.get('is_interface') else "class"
    extends = definition.get('extends', '')
    extends_clause = f" : {extends}" if extends else ""
    
    lines.append(f"{keyword} {class_name}{extends_clause} {{")
    
    # Add properties
    for prop in definition.get('properties', []):
        lines.append(f"    val {prop}: Any // property")
    
    # Add methods
    for method in definition.get('methods', []):
        lines.append(f"    fun {method}() // method")
    
    lines.append("}")
    
    return '\n'.join(lines)


def generate_detail_mapping(kotlin_type, java_type):
    """Generate detailed mapping between Kotlin and Java types."""
    kotlin_def = TYPE_DEFINITIONS.get(kotlin_type, {})
    java_def = TYPE_DEFINITIONS.get(java_type, {})
    
    mappings = {
        'kotlin_type': kotlin_type,
        'java_type': java_type,
        'property_mappings': [],
        'method_mappings': []
    }
    
    # Map Kotlin properties to Java methods
    kotlin_props = kotlin_def.get('properties', [])
    java_methods = java_def.get('methods', [])
    
    for prop in kotlin_props:
        # Common property to method mappings
        if prop == 'size' and 'size' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'size',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'length' and 'length' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'length',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'message' and 'getMessage' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'getMessage',
                'note': 'Kotlin property maps to Java getter method'
            })
        elif prop == 'cause' and 'getCause' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'getCause',
                'note': 'Kotlin property maps to Java getter method'
            })
        elif prop == 'stackTrace' and 'getStackTrace' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'getStackTrace',
                'note': 'Kotlin property maps to Java getter method'
            })
        elif prop == 'name' and 'name' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'name',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'ordinal' and 'ordinal' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'ordinal',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'entries' and 'entrySet' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'entrySet',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'keys' and 'keySet' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'keySet',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'values' and 'values' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'values',
                'note': 'Kotlin property maps to Java method'
            })
        elif prop == 'key' and 'getKey' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'getKey',
                'note': 'Kotlin property maps to Java getter method'
            })
        elif prop == 'value' and 'getValue' in java_methods:
            mappings['property_mappings'].append({
                'kotlin_property': prop,
                'java_method': 'getValue',
                'note': 'Kotlin property maps to Java getter method'
            })
    
    # Map common methods
    kotlin_methods = kotlin_def.get('methods', [])
    for method in kotlin_methods:
        if method in java_methods:
            mappings['method_mappings'].append({
                'kotlin_method': method,
                'java_method': method,
                'note': 'Direct method mapping'
            })
        # Special case for Kotlin's get() which maps to charAt() in String/CharSequence
        elif method == 'get' and 'charAt' in java_methods:
            mappings['method_mappings'].append({
                'kotlin_method': 'get',
                'java_method': 'charAt',
                'note': 'Kotlin operator fun get maps to Java charAt method'
            })
    
    return mappings


def main():
    # Read mapped types from YAML
    with open('mapped-types.yaml', 'r') as f:
        data = yaml.safe_load(f)
    
    mappings = data['mappings']
    
    # Create output directory
    output_dir = Path('mappings')
    output_dir.mkdir(exist_ok=True)
    
    # Process each mapping
    for mapping in mappings:
        kotlin_type = mapping['kotlin']
        java_type = mapping['java']
        
        # Create directory for this mapping
        dir_name = sanitize_dir_name(f"{kotlin_type}_to_{java_type}")
        mapping_dir = output_dir / dir_name
        mapping_dir.mkdir(exist_ok=True)
        
        # Generate Java definition
        java_def = TYPE_DEFINITIONS.get(java_type, {'type': 'class', 'methods': [], 'is_interface': False})
        java_content = generate_java_definition(java_type, java_def)
        with open(mapping_dir / 'java-definition.java', 'w') as f:
            f.write(java_content)
        
        # Generate Kotlin definition
        kotlin_def = TYPE_DEFINITIONS.get(kotlin_type, {'type': 'class', 'methods': [], 'properties': [], 'is_interface': False})
        kotlin_content = generate_kotlin_definition(kotlin_type, kotlin_def)
        with open(mapping_dir / 'kotlin-definition.kt', 'w') as f:
            f.write(kotlin_content)
        
        # Generate detailed mapping
        detail_mapping = generate_detail_mapping(kotlin_type, java_type)
        with open(mapping_dir / 'mapping-details.yaml', 'w') as f:
            yaml.dump(detail_mapping, f, default_flow_style=False, sort_keys=False)
        
        print(f"Generated mapping for {kotlin_type} <-> {java_type}")
    
    print(f"\nAll mappings generated in {output_dir}/")


if __name__ == '__main__':
    main()
