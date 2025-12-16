# Geocode


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Address name | [optional] [default to undefined]
**label** | **string** | Full address label | [optional] [default to undefined]
**id** | **string** | Address ID | [optional] [default to undefined]
**type** | **string** | Address type | [optional] [default to undefined]
**coord** | [**Coord**](Coord.md) |  | [optional] [default to undefined]
**house_number** | **string** | House number | [optional] [default to undefined]
**street** | **string** | Street name | [optional] [default to undefined]
**administrative_regions** | [**Array&lt;GeocodeAdministrativeRegionsInner&gt;**](GeocodeAdministrativeRegionsInner.md) | List of administrative regions | [optional] [default to undefined]

## Example

```typescript
import { Geocode } from './api';

const instance: Geocode = {
    name,
    label,
    id,
    type,
    coord,
    house_number,
    street,
    administrative_regions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
