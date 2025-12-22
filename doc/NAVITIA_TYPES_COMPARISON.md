# Navitia C++ Types vs OpenAPI Schemas Comparison Report

## Executive Summary

This report compares the C++ type definitions from the Navitia source code repository (`source/type/`) with the OpenAPI schema definitions in `openapi.json`. The comparison reveals that while the core models align, there are differences in:

1. **Field naming**: C++ uses internal field names, OpenAPI uses API-oriented names
2. **Field visibility**: C++ includes internal/implementation fields not exposed via API
3. **Type coverage**: Some C++ types are not exposed in the API, and some API types are composite/response wrappers

## Core Model Comparison

### Types Present in Both

| C++ Type | OpenAPI Schema | Status |
|----------|----------------|--------|
| `StopArea` | `StopArea` | ✓ Match |
| `StopPoint` | `StopPoint` | ✓ Match |
| `Line` | `Line` | ✓ Match |
| `Route` | `Route` | ✓ Match |
| `VehicleJourney` | `VehicleJourney` | ✓ Match |
| `Network` | `Network` | ✓ Match |
| `CommercialMode` | `CommercialMode` | ✓ Match |
| `PhysicalMode` | `PhysicalMode` | ✓ Match |
| `Company` | `Company` | ✓ Match |
| `Contributor` | `Contributor` | ✓ Match |
| `Dataset` | `Dataset` | ✓ Match |
| `StopTime` | `StopTime` | ✓ Match (struct, not class) |

### Types Only in C++ (Internal/Implementation)

These types exist in the C++ codebase but are not exposed as separate API models:

- `AccessPoint` - Access point to stop areas
- `Calendar` - Calendar definitions (may be represented differently in API)
- `DiscreteVehicleJourney` - Subclass of VehicleJourney
- `FrequencyVehicleJourney` - Subclass of VehicleJourney  
- `LineGroup` - Grouping of lines
- `StopPointConnection` - Connections between stop points

### Types Only in OpenAPI (API-Specific)

These are API response wrappers or composite types not directly corresponding to C++ structs:

- `Journey` - Composite response type for journey planning results
- `JourneyItem`, `JourneyPattern`, `Section` - Journey-related composite types
- `Arrival`, `Departure` - Schedule entry types
- `Disruption`, `Impact`, `Severity` - Disruption-related types
- `Fare`, `FareTotal` - Fare calculation types
- `Place`, `Geocode` - Geocoding types
- Various `*Response` types - API response wrappers

## Detailed Field Comparison

### StopArea

**C++ Fields:**
- `coord` (GeographicalCoord)
- `timezone` (string)
- `additional_data` (string)
- `admin_list` (vector<Admin*>)
- `wheelchair_boarding` (bool)
- `label` (string)
- `route_list` (flat_set<Route*>)
- `stop_point_list` (vector<StopPoint*>)

**OpenAPI Fields:**
- `id` (string) - API identifier
- `name` (string) - Name (from Nameable interface)
- `coord` (Coord) - Coordinates
- `timezone` (string)
- `stop_points` (array of StopPoint) - Serialized stop points
- `links` (array of Link) - HATEOAS links

**Analysis:**
- Core fields (`coord`, `timezone`) match
- C++ has internal references (`route_list`, `admin_list`) that are serialized differently in API
- OpenAPI adds API-specific fields (`id`, `links`, `name`)

### Line

**C++ Fields:**
- `code` (string)
- `forward_name`, `backward_name` (string)
- `color`, `text_color` (string)
- `commercial_mode` (CommercialMode*)
- `network` (Network*)
- `company_list` (vector<Company*>)
- `route_list` (vector<Route*>)
- `physical_mode_list` (vector<PhysicalMode*>)
- `calendar_list` (vector<Calendar*>)
- `shape` (MultiLineString)
- `properties` (map<string, string>)
- `additional_data` (string)

**OpenAPI Fields:**
- `id` (string)
- `name` (string)
- `code` (string)
- `color`, `text_color` (string)
- `commercial_mode` (CommercialMode)
- `network` (Network)
- `physical_modes` (array of PhysicalMode)
- `links` (array of Link)

**Analysis:**
- Core fields match (`code`, `color`, `text_color`, `commercial_mode`, `network`)
- C++ has directional names (`forward_name`, `backward_name`) vs single `name` in API
- C++ has internal lists that are serialized as arrays in API
- OpenAPI adds API-specific fields (`id`, `links`)

### VehicleJourney

**C++ Fields:**
- `route` (Route*)
- `physical_mode` (PhysicalMode*)
- `company` (Company*)
- `stop_time_list` (vector<StopTime>)
- `headsign` (string)
- `meta_vj` (MetaVehicleJourney*)
- `realtime_level` (RTLevel)
- `validity_patterns` (map<RTLevel, ValidityPattern*>)
- `shift` (size_t)
- Internal navigation: `next_vj`, `prev_vj`

**OpenAPI Fields:**
- `id` (string)
- `name` (string)
- `headsign` (string)
- `journey_pattern` (JourneyPattern)
- `stop_times` (array of StopTime)
- `disruptions` (array of Disruption)
- `links` (array of Link)

**Analysis:**
- Core field `headsign` matches
- C++ has internal realtime/validity pattern management not directly exposed
- OpenAPI exposes `journey_pattern` and `disruptions` which are computed/aggregated
- Internal navigation pointers (`next_vj`, `prev_vj`) are not in API

### StopTime

**C++ Fields:**
- `arrival_time` (uint32_t) - seconds since midnight
- `departure_time` (uint32_t) - seconds since midnight
- `boarding_time` (uint32_t)
- `alighting_time` (uint32_t)
- `stop_point` (StopPoint*)
- `vehicle_journey` (VehicleJourney*)
- `properties` (bitset) - flags for pickup_allowed, drop_off_allowed, etc.
- `local_traffic_zone` (uint16_t)

**OpenAPI Fields:**
- `arrival_time` (string) - HHmmss format
- `departure_time` (string) - HHmmss format
- `utc_arrival_time` (string) - YYYYMMDDTHHmmss
- `utc_departure_time` (string) - YYYYMMDDTHHmmss
- `pickup_allowed` (boolean)
- `drop_off_allowed` (boolean)
- `skipped_stop` (boolean)
- `headsign` (string)
- `stop_point` (StopPoint)

**Analysis:**
- Core timing fields match but with different representations (uint32 vs string)
- C++ uses bitset for properties, OpenAPI uses boolean fields
- OpenAPI adds UTC time variants and headsign
- C++ has internal references (`vehicle_journey`) not in API

## Key Findings

### 1. **Naming Conventions**
- C++ uses snake_case for fields
- OpenAPI uses snake_case for fields (consistent)
- C++ internal references use `*_list` suffix, OpenAPI uses plural names

### 2. **Data Representation**
- **C++**: Uses pointers and references for relationships
- **OpenAPI**: Uses embedded objects or references via `id`/`links`
- **C++**: Internal types (uint32_t, bitset) 
- **OpenAPI**: API-friendly types (string, boolean)

### 3. **Field Mapping Patterns**
- Internal C++ fields → Not in OpenAPI (e.g., `next_vj`, `prev_vj`, `meta_vj`)
- C++ pointer fields → OpenAPI embedded objects or links (e.g., `route*` → `route`)
- C++ vector fields → OpenAPI arrays (e.g., `stop_point_list` → `stop_points`)
- C++ bitset flags → OpenAPI boolean fields (e.g., `properties[PICK_UP]` → `pickup_allowed`)

### 4. **Missing in OpenAPI**
Some C++ types that might be useful to expose:
- `AccessPoint` - Could be useful for accessibility information
- `Calendar` - Calendar definitions (may be in API under different name)
- `LineGroup` - Line groupings

### 5. **API-Specific Additions**
OpenAPI adds fields not in C++ core types:
- `id` - API identifiers
- `links` - HATEOAS links
- `name` - Often derived from C++ `Nameable` interface
- Response wrappers (`*Response` types)

## Recommendations

1. **Documentation**: Document the mapping between C++ types and OpenAPI schemas
2. **Consistency**: Ensure field naming is consistent between C++ and OpenAPI
3. **Coverage**: Consider exposing `AccessPoint` and `Calendar` if they provide value to API consumers
4. **Type Safety**: Ensure serialization/deserialization correctly maps between representations
5. **Validation**: Add validation to ensure OpenAPI schemas accurately represent the C++ types

## Conclusion

The C++ types and OpenAPI schemas **describe the same core models** but with different representations appropriate to their contexts:
- **C++ types**: Internal data structures optimized for computation and memory
- **OpenAPI schemas**: API response models optimized for serialization and client consumption

The differences are expected and appropriate for their respective use cases. The core entities (StopArea, StopPoint, Line, Route, VehicleJourney, etc.) are consistently represented in both, with appropriate transformations for API exposure.

