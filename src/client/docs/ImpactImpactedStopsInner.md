# ImpactImpactedStopsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Stop ID | [optional] [default to undefined]
**name** | **string** | Stop name | [optional] [default to undefined]
**stop_point** | [**StopPoint**](StopPoint.md) |  | [optional] [default to undefined]
**stop_area** | [**StopArea**](StopArea.md) |  | [optional] [default to undefined]
**base_arrival_time** | **string** | Base arrival time (HHmmss) | [optional] [default to undefined]
**base_departure_time** | **string** | Base departure time (HHmmss) | [optional] [default to undefined]
**amended_arrival_time** | **string** | Amended arrival time (HHmmss) | [optional] [default to undefined]
**amended_departure_time** | **string** | Amended departure time (HHmmss) | [optional] [default to undefined]
**cause** | **string** | Cause for the stop impact | [optional] [default to undefined]
**stop_time_effect** | **string** | Stop time effect (e.g., delayed) | [optional] [default to undefined]
**departure_status** | **string** | Departure status (e.g., delayed, unchanged) | [optional] [default to undefined]
**arrival_status** | **string** | Arrival status (e.g., delayed, unchanged) | [optional] [default to undefined]
**is_detour** | **boolean** | Whether this stop is part of a detour | [optional] [default to undefined]

## Example

```typescript
import { ImpactImpactedStopsInner } from './api';

const instance: ImpactImpactedStopsInner = {
    id,
    name,
    stop_point,
    stop_area,
    base_arrival_time,
    base_departure_time,
    amended_arrival_time,
    amended_departure_time,
    cause,
    stop_time_effect,
    departure_status,
    arrival_status,
    is_detour,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
