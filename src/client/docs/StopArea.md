# StopArea


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Stop area ID | [optional] [default to undefined]
**name** | **string** | Stop area name | [optional] [default to undefined]
**coord** | [**Coord**](Coord.md) |  | [optional] [default to undefined]
**timezone** | **string** | Timezone | [optional] [default to undefined]
**stop_points** | [**Array&lt;StopPoint&gt;**](StopPoint.md) |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]

## Example

```typescript
import { StopArea } from './api';

const instance: StopArea = {
    id,
    name,
    coord,
    timezone,
    stop_points,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
