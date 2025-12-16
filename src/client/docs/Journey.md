# Journey


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**journeys** | [**Array&lt;JourneyItem&gt;**](JourneyItem.md) |  | [optional] [default to undefined]
**disruptions** | [**Array&lt;Disruption&gt;**](Disruption.md) |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]
**feed_publishers** | [**Array&lt;FeedPublisher&gt;**](FeedPublisher.md) |  | [optional] [default to undefined]
**terminus** | [**Array&lt;StopArea&gt;**](StopArea.md) |  | [optional] [default to undefined]
**tickets** | **Array&lt;object&gt;** |  | [optional] [default to undefined]
**notes** | **Array&lt;object&gt;** |  | [optional] [default to undefined]
**exceptions** | **Array&lt;object&gt;** |  | [optional] [default to undefined]
**context** | [**Context**](Context.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Journey } from './api';

const instance: Journey = {
    journeys,
    disruptions,
    links,
    feed_publishers,
    terminus,
    tickets,
    notes,
    exceptions,
    context,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
