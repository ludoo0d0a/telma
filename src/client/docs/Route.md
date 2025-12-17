# Route


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Route ID | [optional] [default to undefined]
**name** | **string** | Route name | [optional] [default to undefined]
**direction** | [**StopArea**](StopArea.md) |  | [optional] [default to undefined]
**line** | [**Line**](Line.md) |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Route } from './api';

const instance: Route = {
    id,
    name,
    direction,
    line,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
