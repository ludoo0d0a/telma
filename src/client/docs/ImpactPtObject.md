# ImpactPtObject

Affected PT object

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | PT object ID | [optional] [default to undefined]
**name** | **string** | PT object name | [optional] [default to undefined]
**quality** | **number** | PT object quality indicator | [optional] [default to undefined]
**trip** | [**ImpactPtObjectTrip**](ImpactPtObjectTrip.md) |  | [optional] [default to undefined]
**embedded_type** | **string** | Embedded object type | [optional] [default to undefined]

## Example

```typescript
import { ImpactPtObject } from './api';

const instance: ImpactPtObject = {
    id,
    name,
    quality,
    trip,
    embedded_type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
