# Missing Fields Added to OpenAPI Schemas

## Summary

Added missing fields from C++ types to OpenAPI schemas for matching entities. These fields were identified as useful for API consumers and are not internal implementation details.

## Fields Added

### StopArea
- ✅ **label** (string) - Stop area label
- ✅ **wheelchair_boarding** (boolean) - Whether wheelchair boarding is available
- ✅ **additional_data** (string) - Additional data

### StopPoint
- ✅ **label** (string) - Stop point label
- ✅ **platform_code** (string) - Platform code
- ✅ **fare_zone** (string) - Fare zone
- ✅ **address_id** (string) - Address ID
- ✅ **address** (object) - Address information with id, name, and coord

### Line
- ✅ **additional_data** (string) - Additional data
- ✅ **properties** (object) - Additional properties (key-value pairs)

### Network
- ✅ **address_name** (string) - Address name
- ✅ **address_number** (string) - Address number
- ✅ **address_type_name** (string) - Address type name

### Company
- ✅ **address_name** (string) - Address name
- ✅ **address_number** (string) - Address number
- ✅ **address_type_name** (string) - Address type name

## Fields NOT Added (Internal/Implementation)

The following fields were identified but **not added** as they are internal implementation details:

### StopArea
- `admin_list` - Internal reference list
- `route_list` - Internal reference list
- `stop_point_list` - Already represented as `stop_points` array

### StopPoint
- `admin_list` - Internal reference list
- `access_points` - Internal reference set
- `network` - Already represented as embedded object
- `stop_point_connection_list` - Internal reference list
- `dataset_list` - Internal reference set
- `route_list` - Internal reference list
- `is_zonal` - Internal flag

### Line
- `forward_name`, `backward_name` - Internal directional names (already have `name`)
- `company_list` - Internal reference list
- `route_list` - Internal reference list
- `physical_mode_list` - Already represented as `physical_modes` array
- `calendar_list` - Internal reference list
- `shape` - Internal geometry data
- `line_group_list` - Internal reference list

### VehicleJourney
- `route`, `physical_mode`, `company` - Already represented as embedded objects
- `next_vj`, `prev_vj`, `meta_vj` - Internal navigation pointers
- `realtime_level`, `validity_patterns`, `shift` - Internal realtime management
- `stop_time_list` - Already represented as `stop_times` array
- `dataset` - Internal reference

### Route
- `destination` - Already represented as `direction` (StopArea)
- `shape` - Internal geometry data
- `discrete_vehicle_journey_list`, `frequency_vehicle_journey_list` - Internal reference lists
- `stop_area_list`, `stop_point_list` - Internal reference lists
- `dataset_list` - Internal reference set

## Validation

✅ All JSON schemas are valid  
✅ All fields follow OpenAPI best practices  
✅ Field types are appropriately converted from C++ to OpenAPI types

## Impact

These additions improve API completeness by exposing useful fields that were present in the C++ data model but missing from the API specification. This enhances:
- **Accessibility information** (wheelchair_boarding)
- **Location details** (label, platform_code, address information)
- **Fare information** (fare_zone)
- **Extended metadata** (additional_data, properties)

