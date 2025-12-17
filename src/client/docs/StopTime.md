# StopTime


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**arrival_time** | **string** | Arrival time (HHmmss) | [optional] [default to undefined]
**departure_time** | **string** | Departure time (HHmmss) | [optional] [default to undefined]
**headsign** | **string** | Headsign | [optional] [default to undefined]
**pickup_allowed** | **boolean** | Whether pickup is allowed | [optional] [default to undefined]
**drop_off_allowed** | **boolean** | Whether drop off is allowed | [optional] [default to undefined]
**skipped_stop** | **boolean** | Whether stop is skipped | [optional] [default to undefined]
**stop_point** | [**StopPoint**](StopPoint.md) |  | [optional] [default to undefined]
**utc_arrival_time** | **string** | UTC arrival time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**utc_departure_time** | **string** | UTC departure time (YYYYMMDDTHHmmss) | [optional] [default to undefined]

## Example

```typescript
import { StopTime } from './api';

const instance: StopTime = {
    arrival_time,
    departure_time,
    headsign,
    pickup_allowed,
    drop_off_allowed,
    skipped_stop,
    stop_point,
    utc_arrival_time,
    utc_departure_time,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
