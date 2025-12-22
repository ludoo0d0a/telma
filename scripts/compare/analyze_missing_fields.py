#!/usr/bin/env python3
"""
Analyze missing fields from C++ types that should be added to OpenAPI
"""

import json
import os
import re
import subprocess
from typing import Dict, List, Set

# C++ type files to check
TYPE_FILES = [
    "stop_area.h", "stop_point.h", "line.h", "route.h", 
    "vehicle_journey.h", "stop_time.h", "network.h",
    "commercial_mode.h", "physical_mode.h", "company.h",
    "contributor.h", "dataset.h", "calendar.h", "connection.h",
    "access_point.h", "entry_point.h", "message.h", "comment.h"
]

BASE_URL = "https://raw.githubusercontent.com/hove-io/navitia/dev/source/type"

def fetch_cpp_file(filename: str) -> str:
    """Fetch a C++ header file from GitHub"""
    try:
        result = subprocess.run(
            ["curl", "-s", f"{BASE_URL}/{filename}"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout
    except Exception as e:
        print(f"Error fetching {filename}: {e}")
        return ""

def extract_struct_fields(cpp_content: str, struct_name: str) -> Dict[str, str]:
    """Extract field names and types from a struct"""
    fields = {}
    in_struct = False
    brace_count = 0
    
    lines = cpp_content.split('\n')
    for i, line in enumerate(lines):
        # Check if we're entering the struct
        if f"struct {struct_name}" in line or f"class {struct_name}" in line:
            in_struct = True
            brace_count = line.count('{') - line.count('}')
            continue
        
        if in_struct:
            brace_count += line.count('{') - line.count('}')
            
            # Exit struct
            if brace_count < 0:
                break
            
            # Skip comments, empty lines, methods, templates
            line_stripped = line.strip()
            if (not line_stripped or 
                line_stripped.startswith('//') or
                line_stripped.startswith('/*') or
                line_stripped.startswith('*') or
                line_stripped.startswith('template') or
                '(' in line_stripped and ')' in line_stripped or
                line_stripped.startswith('const static') or
                line_stripped.startswith('Indexes get') or
                line_stripped.startswith('bool operator') or
                line_stripped.startswith('void serialize') or
                line_stripped.startswith('std::string get_') or
                line_stripped.startswith('~') or
                line_stripped.startswith('private:') or
                line_stripped.startswith('public:') or
                line_stripped.startswith('protected:')):
                continue
            
            # Try to extract field: type name;
            field_pattern = r'(\w+(?:::\w+)*(?:<[^>]+>)?(?:\*|&)?(?:\s+\w+)*)\s+(\w+)\s*[;=]'
            match = re.search(field_pattern, line)
            if match:
                field_type = match.group(1).strip()
                field_name = match.group(2).strip()
                # Skip if it looks like a method
                if not ('(' in field_name or ')' in field_name):
                    fields[field_name] = field_type
    
    return fields

def should_expose_field(field_name: str, field_type: str) -> bool:
    """Determine if a field should be exposed in OpenAPI"""
    # Skip internal navigation fields
    if field_name in ['next_vj', 'prev_vj', 'meta_vj']:
        return False
    
    # Skip internal implementation details
    if field_name in ['validity_patterns', 'shift', 'realtime_level']:
        return False
    
    # Skip internal lists that are already represented differently
    if field_name.endswith('_list') and field_name not in ['stop_point_list']:
        # Some lists might be useful, but most are internal
        return False
    
    # Skip internal references that are already in OpenAPI as embedded objects
    if '*' in field_type and field_name in ['route', 'network', 'commercial_mode', 'physical_mode', 'company']:
        return False
    
    # Include useful fields
    if field_name in ['wheelchair_boarding', 'label', 'code', 'additional_data', 'properties']:
        return True
    
    # Include coordinate and location fields
    if 'coord' in field_name.lower() or 'address' in field_name.lower():
        return True
    
    # Include accessibility fields
    if 'wheelchair' in field_name.lower() or 'accessibility' in field_name.lower():
        return True
    
    # Include platform and zone information
    if 'platform' in field_name.lower() or 'zone' in field_name.lower():
        return True
    
    return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    openapi_path = os.path.join(project_root, 'public', 'openapi.json')
    
    with open(openapi_path, 'r') as f:
        openapi_data = json.load(f)
    
    openapi_schemas = openapi_data.get('components', {}).get('schemas', {})
    
    # Core types to check
    core_types = [
        'StopArea', 'StopPoint', 'Line', 'Route', 'VehicleJourney',
        'Network', 'CommercialMode', 'PhysicalMode', 'Company', 'Contributor',
        'Dataset', 'Calendar', 'AccessPoint', 'StopPointConnection'
    ]
    
    missing_fields = {}
    
    for type_name in core_types:
        if type_name not in openapi_schemas:
            continue
        
        # Find the C++ file
        type_file_map = {
            'StopArea': 'stop_area.h',
            'StopPoint': 'stop_point.h',
            'Line': 'line.h',
            'Route': 'route.h',
            'VehicleJourney': 'vehicle_journey.h',
            'Network': 'network.h',
            'CommercialMode': 'commercial_mode.h',
            'PhysicalMode': 'physical_mode.h',
            'Company': 'company.h',
            'Contributor': 'contributor.h',
            'Dataset': 'dataset.h',
            'Calendar': 'calendar.h',
            'AccessPoint': 'access_point.h',
            'StopPointConnection': 'connection.h'
        }
        
        type_file = type_file_map.get(type_name)
        if not type_file:
            continue
        
        print(f"\n=== Analyzing {type_name} ===")
        cpp_content = fetch_cpp_file(type_file)
        if not cpp_content:
            continue
        
        cpp_fields = extract_struct_fields(cpp_content, type_name)
        openapi_props = openapi_schemas[type_name].get('properties', {})
        openapi_fields = set(openapi_props.keys())
        
        # Find missing fields that should be exposed
        for field_name, field_type in cpp_fields.items():
            if field_name not in openapi_fields:
                if should_expose_field(field_name, field_type):
                    if type_name not in missing_fields:
                        missing_fields[type_name] = []
                    missing_fields[type_name].append({
                        'name': field_name,
                        'type': field_type,
                        'cpp_type': field_type
                    })
                    print(f"  ✓ {field_name} ({field_type}) - should be added")
                else:
                    print(f"  ✗ {field_name} ({field_type}) - internal, skip")
    
    print("\n" + "=" * 80)
    print("SUMMARY OF MISSING FIELDS TO ADD")
    print("=" * 80)
    for type_name, fields in missing_fields.items():
        print(f"\n{type_name}:")
        for field in fields:
            print(f"  - {field['name']}: {field['cpp_type']}")
    
    return missing_fields

if __name__ == '__main__':
    main()

