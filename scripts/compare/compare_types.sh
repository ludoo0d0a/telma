#!/bin/bash

# Script to compare Navitia C++ types with OpenAPI schemas

echo "=== Extracting C++ struct/class names from Navitia type headers ==="
echo ""

# List of type header files to check
TYPES=(
    "stop_area.h"
    "stop_point.h"
    "line.h"
    "route.h"
    "vehicle_journey.h"
    "stop_time.h"
    "network.h"
    "commercial_mode.h"
    "physical_mode.h"
    "company.h"
    "contributor.h"
    "dataset.h"
    "calendar.h"
    "connection.h"
    "access_point.h"
    "entry_point.h"
    "message.h"
    "comment.h"
)

echo "C++ Types found in headers:"
echo "----------------------------"

for type_file in "${TYPES[@]}"; do
    echo ""
    echo "=== $type_file ==="
    curl -s "https://raw.githubusercontent.com/hove-io/navitia/dev/source/type/$type_file" | \
        grep -E "^(struct|class)\s+\w+\s*[:]" | \
        sed 's/^[[:space:]]*//' | \
        head -5
done

echo ""
echo ""
echo "=== OpenAPI Schema names ==="
echo "----------------------------"
# Get script directory and resolve path to openapi.json
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cat "$PROJECT_ROOT/public/openapi.json" | jq -r '.components.schemas | keys[]' | sort

