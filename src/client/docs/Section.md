# Section


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Section ID | [optional] [default to undefined]
**type** | **string** | Section type | [optional] [default to undefined]
**from** | [**Place**](Place.md) |  | [optional] [default to undefined]
**to** | [**Place**](Place.md) |  | [optional] [default to undefined]
**duration** | **number** | Duration in seconds | [optional] [default to undefined]
**departure_date_time** | **string** | Departure date time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**arrival_date_time** | **string** | Arrival date time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**base_departure_date_time** | **string** | Base departure date time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**base_arrival_date_time** | **string** | Base arrival date time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**geojson** | **object** | GeoJSON geometry | [optional] [default to undefined]
**mode** | **string** | Transport mode | [optional] [default to undefined]
**transfer_type** | **string** | Transfer type | [optional] [default to undefined]
**display_informations** | [**DisplayInformation**](DisplayInformation.md) |  | [optional] [default to undefined]
**vehicle_journey** | [**SectionVehicleJourney**](SectionVehicleJourney.md) |  | [optional] [default to undefined]
**trip** | [**SectionTrip**](SectionTrip.md) |  | [optional] [default to undefined]
**route** | [**Route**](Route.md) |  | [optional] [default to undefined]
**stop_date_times** | [**Array&lt;SectionStopDateTimesInner&gt;**](SectionStopDateTimesInner.md) | List of stop times for this section | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Section } from './api';

const instance: Section = {
    id,
    type,
    from,
    to,
    duration,
    departure_date_time,
    arrival_date_time,
    base_departure_date_time,
    base_arrival_date_time,
    geojson,
    mode,
    transfer_type,
    display_informations,
    vehicle_journey,
    trip,
    route,
    stop_date_times,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
