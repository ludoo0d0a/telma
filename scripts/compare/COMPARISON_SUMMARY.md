# Navitia C++ Types vs OpenAPI Schemas - Comparison Summary

**Date:** December 22, 2025  
**OpenAPI Schemas:** 71 total, 19 core models  
**C++ Types Found:** 17 types

## Executive Summary

✅ **Excellent Alignment**: All 17 C++ core types are now present in the OpenAPI specification. The recent additions of `AccessPoint`, `Calendar`, `DiscreteVehicleJourney`, `FrequencyVehicleJourney`, `LineGroup`, and `StopPointConnection` have completed the type coverage.

## Type Coverage

### ✅ Common Types (17 types - 100% coverage)

All C++ core types are represented in OpenAPI:

1. **AccessPoint** - Access points to stop areas
2. **Calendar** - Calendar definitions with week patterns
3. **CommercialMode** - Commercial transport modes
4. **Company** - Transport companies
5. **Contributor** - Data contributors
6. **Dataset** - Data sets
7. **DiscreteVehicleJourney** - Standard vehicle journeys
8. **FrequencyVehicleJourney** - Frequency-based vehicle journeys
9. **Line** - Transport lines
10. **LineGroup** - Line groupings
11. **Network** - Transport networks
12. **PhysicalMode** - Physical transport modes
13. **Route** - Transport routes
14. **StopArea** - Stop areas
15. **StopPoint** - Stop points
16. **StopPointConnection** - Connections between stop points
17. **VehicleJourney** - Vehicle journeys

### ⚠️ Types in OpenAPI but NOT in C++ (2 types)

These are API-specific composite types, not direct C++ struct mappings:

1. **Journey** - Composite response type for journey planning results (contains multiple entities)
2. **StopTime** - Present in OpenAPI and exists in C++ (`stop_time.h`), but not detected by extraction pattern

**Note:** `StopTime` exists in C++ as `struct StopTime {` (without inheritance), but the extraction pattern requires a colon `:` after the struct name (for inheritance syntax). This is a **false positive** - `StopTime` is actually present in both C++ and OpenAPI.

## Field-Level Analysis

### Key Findings

1. **Field Naming Differences** (Expected):
   - C++ uses internal field names: `stop_point_list`, `route_list`
   - OpenAPI uses API-oriented names: `stop_points`, `routes`
   - C++ uses pointers/references, OpenAPI uses embedded objects or references

2. **API-Specific Fields** (Expected):
   - OpenAPI adds: `id`, `links` (HATEOAS), `name` (from Nameable interface)
   - These are serialization/API concerns, not core data model

3. **Internal C++ Fields** (Expected):
   - C++ includes implementation details: `meta_vj`, `next_vj`, `prev_vj`, `validity_patterns`
   - These are not exposed via API for good reasons (internal navigation, optimization)

### Sample Field Comparison

#### StopArea
- **Common fields:** `coord`, `timezone` (2 fields)
- **C++ only:** `additional_data`, `admin_list`, `label`, `route_list`, `stop_point_list`, `wheelchair_boarding` (7 fields)
- **OpenAPI only:** `id`, `links`, `name`, `stop_points` (4 fields)

#### Line
- **Common fields:** `code`, `color`, `commercial_mode`, `network`, `text_color` (5 fields)
- **C++ only:** `additional_data`, `backward_name`, `forward_name`, `calendar_list`, `company_list`, `route_list`, `shape`, `properties` (8 fields)
- **OpenAPI only:** `id`, `links`, `name`, `physical_modes` (4 fields)

#### VehicleJourney
- **Common fields:** `headsign` (1 field)
- **C++ only:** Internal navigation (`next_vj`, `prev_vj`), realtime management (`realtime_level`, `validity_patterns`, `shift`), internal references (15 fields)
- **OpenAPI only:** `id`, `links`, `name`, `journey_pattern`, `disruptions`, `stop_times` (6 fields)

## Conclusions

### ✅ Strengths

1. **Complete Type Coverage**: All C++ core types are now in OpenAPI
2. **Consistent Patterns**: Field naming and structure follow consistent patterns
3. **Appropriate Abstraction**: OpenAPI correctly abstracts away internal C++ implementation details
4. **API Best Practices**: OpenAPI includes proper API concerns (IDs, links, HATEOAS)

### 📝 Observations

1. **Field Mapping**: The differences in field names and presence are **expected and appropriate**:
   - C++ types are optimized for computation and memory
   - OpenAPI schemas are optimized for serialization and client consumption
   - Internal references in C++ become embedded objects or links in OpenAPI

2. **Missing Fields**: Some C++ fields not in OpenAPI are intentionally hidden:
   - Internal navigation pointers (`next_vj`, `prev_vj`)
   - Implementation details (`meta_vj`, `validity_patterns`)
   - Internal optimization structures

3. **Additional Fields**: OpenAPI adds necessary API concerns:
   - Resource identifiers (`id`)
   - Hypermedia links (`links`)
   - Computed/aggregated data (`disruptions`, `journey_pattern`)

## Recommendations

1. ✅ **Type Coverage**: Complete - all core types are present
2. 📋 **Documentation**: Consider documenting the mapping between C++ types and OpenAPI schemas
3. 🔍 **Field Visibility**: Review if any C++ fields should be exposed (e.g., `wheelchair_boarding` in StopArea)
4. ✅ **Validation**: Current state is appropriate - differences are by design

## Status: ✅ ALIGNED

The C++ types and OpenAPI schemas are **properly aligned**. The differences observed are intentional design decisions appropriate for their respective contexts:
- **C++**: Internal data structures for computation
- **OpenAPI**: API response models for client consumption

The recent additions have successfully completed the type coverage, bringing the alignment to 100% for core model types.

