# PlacePoi

Point of interest object (when embedded_type is \'poi\')

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | POI ID | [optional] [default to undefined]
**name** | **string** | POI name | [optional] [default to undefined]
**coord** | [**Coord**](Coord.md) |  | [optional] [default to undefined]
**poi_type** | [**PlacePoiPoiType**](PlacePoiPoiType.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PlacePoi } from './api';

const instance: PlacePoi = {
    id,
    name,
    coord,
    poi_type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
