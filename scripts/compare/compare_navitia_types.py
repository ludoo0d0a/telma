#!/usr/bin/env python3
"""
Compare Navitia C++ types with OpenAPI schemas
"""

import json
import os
import re
import subprocess
from typing import Dict, List, Set, Tuple
from collections import defaultdict

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

def extract_struct_names(cpp_content: str) -> List[str]:
    """Extract struct/class names from C++ code"""
    structs = []
    # Match: struct Name : or class Name :
    pattern = r'^\s*(struct|class)\s+(\w+)\s*[:<]'
    for line in cpp_content.split('\n'):
        match = re.match(pattern, line)
        if match:
            structs.append(match.group(2))
    return structs

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
            # Match patterns like: Type field_name;
            field_pattern = r'(\w+(?:::\w+)*(?:<[^>]+>)?(?:\*|&)?(?:\s+\w+)*)\s+(\w+)\s*[;=]'
            match = re.search(field_pattern, line)
            if match:
                field_type = match.group(1).strip()
                field_name = match.group(2).strip()
                # Skip if it looks like a method
                if not ('(' in field_name or ')' in field_name):
                    fields[field_name] = field_type
    
    return fields

def load_openapi_schemas(openapi_file: str) -> Dict:
    """Load OpenAPI schemas"""
    with open(openapi_file, 'r') as f:
        data = json.load(f)
    return data.get('components', {}).get('schemas', {})

def normalize_name(name: str) -> str:
    """Normalize names for comparison"""
    # Remove Response suffix
    name = re.sub(r'Response$', '', name)
    # Convert to PascalCase if needed
    return name

def main():
    print("=" * 80)
    print("Navitia C++ Types vs OpenAPI Schemas Comparison")
    print("=" * 80)
    print()
    
    # Load OpenAPI schemas
    print("Loading OpenAPI schemas...")
    # Get the script directory and resolve path to openapi.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    openapi_path = os.path.join(project_root, 'public', 'openapi.json')
    openapi_schemas = load_openapi_schemas(openapi_path)
    openapi_names = set(openapi_schemas.keys())
    
    # Filter out Response types for core model comparison
    core_openapi_names = {name for name in openapi_names 
                         if not name.endswith('Response') and 
                         name not in ['Link', 'Pagination', 'Error', 'Context', 
                                     'Coord', 'Geocode', 'Place', 'DisplayInformation',
                                     'Severity', 'Impact', 'Disruption', 'Fare', 
                                     'FareTotal', 'Co2Emission', 'Co2EmissionRate',
                                     'AirPollutants', 'ActivePeriod', 'WeekPattern',
                                     'JourneyCalendar', 'JourneyDistances', 'JourneyItem',
                                     'JourneyPattern', 'Section', 'Arrival', 'Departure',
                                     'TerminusSchedule', 'RouteSchedule', 'StopSchedule',
                                     'DateTime', 'POIType', 'Coverage', 'FeedPublisher']}
    
    print(f"Found {len(openapi_schemas)} total schemas")
    print(f"Found {len(core_openapi_names)} core model schemas")
    print()
    
    # Extract C++ types
    print("Extracting C++ types from headers...")
    cpp_types = {}
    cpp_type_names = set()
    
    for type_file in TYPE_FILES:
        print(f"  Processing {type_file}...")
        content = fetch_cpp_file(type_file)
        if not content:
            continue
        
        structs = extract_struct_names(content)
        for struct_name in structs:
            if struct_name not in ['Header', 'Nameable', 'hasProperties', 
                                  'HasMessages', 'hasVehicleProperties']:
                cpp_type_names.add(struct_name)
                fields = extract_struct_fields(content, struct_name)
                cpp_types[struct_name] = {
                    'file': type_file,
                    'fields': fields
                }
    
    print(f"Found {len(cpp_type_names)} C++ types")
    print()
    
    # Compare
    print("=" * 80)
    print("COMPARISON RESULTS")
    print("=" * 80)
    print()
    
    # Types in C++ but not in OpenAPI
    only_cpp = cpp_type_names - core_openapi_names
    if only_cpp:
        print(f"Types in C++ but NOT in OpenAPI ({len(only_cpp)}):")
        for name in sorted(only_cpp):
            print(f"  - {name} (from {cpp_types[name]['file']})")
        print()
    
    # Types in OpenAPI but not in C++
    only_openapi = core_openapi_names - cpp_type_names
    if only_openapi:
        print(f"Types in OpenAPI but NOT in C++ ({len(only_openapi)}):")
        for name in sorted(only_openapi):
            print(f"  - {name}")
        print()
    
    # Common types
    common_types = cpp_type_names & core_openapi_names
    print(f"Common types ({len(common_types)}):")
    for name in sorted(common_types):
        print(f"  ✓ {name}")
    print()
    
    # Detailed field comparison for a few key types
    print("=" * 80)
    print("DETAILED FIELD COMPARISON (Sample)")
    print("=" * 80)
    print()
    
    sample_types = ['StopArea', 'Line', 'VehicleJourney', 'StopPoint', 'Route']
    for type_name in sample_types:
        if type_name in common_types:
            print(f"\n--- {type_name} ---")
            
            # C++ fields
            cpp_fields = set(cpp_types.get(type_name, {}).get('fields', {}).keys())
            
            # OpenAPI fields
            openapi_schema = openapi_schemas.get(type_name, {})
            openapi_props = openapi_schema.get('properties', {})
            openapi_fields = set(openapi_props.keys())
            
            print(f"C++ fields ({len(cpp_fields)}): {sorted(cpp_fields)}")
            print(f"OpenAPI fields ({len(openapi_fields)}): {sorted(openapi_fields)}")
            
            # Fields only in C++
            only_cpp_fields = cpp_fields - openapi_fields
            if only_cpp_fields:
                print(f"  Fields only in C++: {sorted(only_cpp_fields)}")
            
            # Fields only in OpenAPI
            only_openapi_fields = openapi_fields - cpp_fields
            if only_openapi_fields:
                print(f"  Fields only in OpenAPI: {sorted(only_openapi_fields)}")
            
            # Common fields
            common_fields = cpp_fields & openapi_fields
            print(f"  Common fields: {len(common_fields)}")

if __name__ == '__main__':
    main()

