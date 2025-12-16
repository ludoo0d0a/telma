# Place


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Place ID | [optional] [default to undefined]
**name** | **string** | Place name | [optional] [default to undefined]
**quality** | **number** | Quality score (0-100, higher is better) | [optional] [default to undefined]
**embedded_type** | **string** | Embedded type - determines which embedded object is populated | [optional] [default to undefined]
**stop_area** | [**StopArea**](StopArea.md) |  | [optional] [default to undefined]
**stop_point** | [**StopPoint**](StopPoint.md) |  | [optional] [default to undefined]
**address** | [**Geocode**](Geocode.md) |  | [optional] [default to undefined]
**poi** | [**PlacePoi**](PlacePoi.md) |  | [optional] [default to undefined]
**administrative_region** | [**PlaceAdministrativeRegion**](PlaceAdministrativeRegion.md) |  | [optional] [default to undefined]
**coord** | [**Coord**](Coord.md) |  | [optional] [default to undefined]
**administrative_regions** | [**Array&lt;PlaceAdministrativeRegionsInner&gt;**](PlaceAdministrativeRegionsInner.md) | List of administrative regions this place belongs to | [optional] [default to undefined]
**distance** | **number** | Distance in meters (for places_nearby endpoint) | [optional] [default to undefined]

## Example

```typescript
import { Place } from './api';

const instance: Place = {
    id,
    name,
    quality,
    embedded_type,
    stop_area,
    stop_point,
    address,
    poi,
    administrative_region,
    coord,
    administrative_regions,
    distance,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
