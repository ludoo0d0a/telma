# PlaceAdministrativeRegion

Administrative region object (when embedded_type is \'administrative_region\')

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Administrative region ID | [optional] [default to undefined]
**name** | **string** | Administrative region name | [optional] [default to undefined]
**label** | **string** | Administrative region label | [optional] [default to undefined]
**coord** | [**Coord**](Coord.md) |  | [optional] [default to undefined]
**level** | **number** | Administrative level (e.g., 8 for city, 7 for department) | [optional] [default to undefined]
**zip_code** | **string** | ZIP code | [optional] [default to undefined]
**insee** | **string** | INSEE code | [optional] [default to undefined]

## Example

```typescript
import { PlaceAdministrativeRegion } from './api';

const instance: PlaceAdministrativeRegion = {
    id,
    name,
    label,
    coord,
    level,
    zip_code,
    insee,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
