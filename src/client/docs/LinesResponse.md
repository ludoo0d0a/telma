# LinesResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**lines** | [**Array&lt;Line&gt;**](Line.md) |  | [optional] [default to undefined]
**pagination** | [**Pagination**](Pagination.md) |  | [optional] [default to undefined]
**feed_publishers** | [**Array&lt;FeedPublisher&gt;**](FeedPublisher.md) |  | [optional] [default to undefined]
**disruptions** | [**Array&lt;Disruption&gt;**](Disruption.md) |  | [optional] [default to undefined]
**origins** | [**Array&lt;StopArea&gt;**](StopArea.md) |  | [optional] [default to undefined]
**terminus** | [**Array&lt;StopArea&gt;**](StopArea.md) |  | [optional] [default to undefined]
**context** | [**Context**](Context.md) |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]

## Example

```typescript
import { LinesResponse } from './api';

const instance: LinesResponse = {
    lines,
    pagination,
    feed_publishers,
    disruptions,
    origins,
    terminus,
    context,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
