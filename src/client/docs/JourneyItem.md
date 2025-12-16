# JourneyItem


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**durations** | [**JourneyItemDurations**](JourneyItemDurations.md) |  | [optional] [default to undefined]
**duration** | **number** | Total duration in seconds (deprecated, use durations.total) | [optional] [default to undefined]
**nb_transfers** | **number** | Number of transfers | [optional] [default to undefined]
**departure_date_time** | **string** | Departure date time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**arrival_date_time** | **string** | Arrival date time (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**sections** | [**Array&lt;Section&gt;**](Section.md) | List of sections in the journey | [optional] [default to undefined]
**type** | **string** | Journey type | [optional] [default to undefined]
**status** | **string** | Journey status | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** | Journey tags | [optional] [default to undefined]
**co2_emission** | [**JourneyItemCo2Emission**](JourneyItemCo2Emission.md) |  | [optional] [default to undefined]

## Example

```typescript
import { JourneyItem } from './api';

const instance: JourneyItem = {
    durations,
    duration,
    nb_transfers,
    departure_date_time,
    arrival_date_time,
    sections,
    type,
    status,
    tags,
    co2_emission,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
