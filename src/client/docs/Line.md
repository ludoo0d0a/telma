# Line


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Line ID | [optional] [default to undefined]
**name** | **string** | Line name | [optional] [default to undefined]
**code** | **string** | Line code | [optional] [default to undefined]
**color** | **string** | Line color (hex) | [optional] [default to undefined]
**text_color** | **string** | Text color (hex) | [optional] [default to undefined]
**commercial_mode** | [**CommercialMode**](CommercialMode.md) |  | [optional] [default to undefined]
**physical_modes** | [**Array&lt;PhysicalMode&gt;**](PhysicalMode.md) |  | [optional] [default to undefined]
**network** | [**Network**](Network.md) |  | [optional] [default to undefined]
**links** | [**Array&lt;Link&gt;**](Link.md) |  | [optional] [default to undefined]

## Example

```typescript
import { Line } from './api';

const instance: Line = {
    id,
    name,
    code,
    color,
    text_color,
    commercial_mode,
    physical_modes,
    network,
    links,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
