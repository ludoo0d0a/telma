# Navitia Types Comparison Scripts

This directory contains scripts for comparing Navitia C++ type definitions with OpenAPI schemas.

## Scripts

### `compare_navitia_types.py`

Comprehensive Python script that:
- Fetches C++ header files from the Navitia GitHub repository
- Extracts struct/class definitions and their fields
- Compares them with OpenAPI schema definitions
- Generates a detailed comparison report

**Usage:**
```bash
python3 compare_navitia_types.py
```

**Output:**
- Lists types in C++ but not in OpenAPI
- Lists types in OpenAPI but not in C++
- Shows common types
- Provides detailed field comparison for sample types

### `compare_types.sh`

Simple bash script that:
- Extracts C++ struct/class names from Navitia type headers
- Lists OpenAPI schema names
- Provides a quick overview comparison

**Usage:**
```bash
bash scripts/compare/compare_types.sh
```

## Notes

- Both scripts automatically resolve paths relative to the project root
- The scripts fetch C++ files directly from GitHub (requires internet connection)
- The OpenAPI schema is read from `public/openapi.json` in the project root

