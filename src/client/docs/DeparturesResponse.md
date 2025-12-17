# DeparturesResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**departures** | [**Array&lt;Departure&gt;**](Departure.md) |  | [optional] [default to undefined]
**disruptions** | [**Array&lt;Disruption&gt;**](Disruption.md) |  | [optional] [default to undefined]
**feed_publishers** | [**Array&lt;FeedPublisher&gt;**](FeedPublisher.md) |  | [optional] [default to undefined]
**origins** | [**Array&lt;StopArea&gt;**](StopArea.md) |  | [optional] [default to undefined]
**terminus** | [**Array&lt;StopArea&gt;**](StopArea.md) |  | [optional] [default to undefined]
**context** | [**Context**](Context.md) |  | [optional] [default to undefined]
**notes** | **Array&lt;object&gt;** |  | [optional] [default to undefined]
**exceptions** | **Array&lt;object&gt;** |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]
**pagination** | [**Pagination**](Pagination.md) |  | [optional] [default to undefined]

## Example

```typescript
import { DeparturesResponse } from './api';

const instance: DeparturesResponse = {
    departures,
    disruptions,
    feed_publishers,
    origins,
    terminus,
    context,
    notes,
    exceptions,
    links,
    pagination,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
