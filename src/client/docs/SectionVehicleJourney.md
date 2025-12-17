# SectionVehicleJourney

Vehicle journey (can be ID string or object)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Vehicle journey ID | [optional] [default to undefined]
**name** | **string** | Vehicle journey name | [optional] [default to undefined]
**headsign** | **string** | Headsign | [optional] [default to undefined]
**journey_pattern** | [**JourneyPattern**](JourneyPattern.md) |  | [optional] [default to undefined]
**stop_times** | [**Array&lt;StopTime&gt;**](StopTime.md) |  | [optional] [default to undefined]
**disruptions** | [**Array&lt;Disruption&gt;**](Disruption.md) |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]

## Example

```typescript
import { SectionVehicleJourney } from './api';

const instance: SectionVehicleJourney = {
    id,
    name,
    headsign,
    journey_pattern,
    stop_times,
    disruptions,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
