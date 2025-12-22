# OpenAPI Schema Additions

## Summary

Added 6 missing C++ types to the OpenAPI schema to complete the type coverage:

1. **AccessPoint** - Access points to stop areas
2. **Calendar** - Calendar definitions with week patterns and exceptions
3. **DiscreteVehicleJourney** - Vehicle journey with specific stop times
4. **FrequencyVehicleJourney** - Frequency-based vehicle journey with regular intervals
5. **LineGroup** - Grouping of related lines
6. **StopPointConnection** - Connections between stop points

## Schema Details

### AccessPoint
- **Location**: After `ActivePeriod`
- **Fields**: 
  - Basic: `id`, `name`, `stop_code`
  - Access: `is_entrance`, `is_exit`
  - Pathway: `pathway_mode`, `length`, `traversal_time`, `stair_count`, `max_slope`, `min_width`
  - Signage: `signposted_as`, `reversed_signposted_as`
  - Location: `coord`, `stop_area` (parent)
  - API: `links`

### Calendar
- **Location**: After `AccessPoint`, before `CommercialMode`
- **Fields**:
  - Basic: `id`, `name`
  - Schedule: `week_pattern`, `active_periods`
  - Exceptions: `exceptions` (array with `type`: "Add"/"Sub" and `date`)
  - API: `links`

### DiscreteVehicleJourney
- **Location**: After `DisplayInformation`
- **Type**: Extends `VehicleJourney` using `allOf`
- **Description**: Discrete vehicle journey with specific stop times (the standard VJ type)

### FrequencyVehicleJourney
- **Location**: After `Fare`
- **Type**: Extends `VehicleJourney` using `allOf`
- **Additional Fields**:
  - `start_time` (string, HHmmss format)
  - `end_time` (string, HHmmss format)
  - `headway_secs` (integer, seconds between departures)
- **Description**: Frequency-based vehicle journey with regular intervals

### LineGroup
- **Location**: After `Line`, before `Route`
- **Fields**:
  - Basic: `id`, `name`
  - Grouping: `main_line` (Line reference), `lines` (array of Line references)
  - API: `links`

### StopPointConnection
- **Location**: After `StopPoint`, before `StopArea`
- **Fields**:
  - Basic: `id`
  - Connection: `departure` (StopPoint), `destination` (StopPoint)
  - Timing: `display_duration`, `duration`, `max_duration` (all in seconds)
  - Type: `connection_type` (enum: "StopPoint", "StopArea", "Walking", "VJ", "Default", "stay_in", "undefined")
  - API: `links`

## Validation

✅ JSON is valid
✅ All 6 schemas are present in the OpenAPI specification
✅ No linting errors

## Notes

- All schemas follow the existing OpenAPI patterns:
  - Include `id` and `name` fields where applicable
  - Include `links` array for HATEOAS support
  - Use appropriate references to other schemas
  - Include descriptive field documentation

- `DiscreteVehicleJourney` and `FrequencyVehicleJourney` use `allOf` to extend `VehicleJourney`, reflecting their inheritance relationship in the C++ code.

- Field types are converted from C++ types to OpenAPI types:
  - `uint32_t` → `integer` or `string` (for time formats)
  - `bool` → `boolean`
  - `std::string` → `string`
  - Pointers → References using `$ref`
  - Vectors → Arrays

