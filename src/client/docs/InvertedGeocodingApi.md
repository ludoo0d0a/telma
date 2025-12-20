# InvertedGeocodingApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coordsCoordGet**](#coordscoordget) | **GET** /coords/{coord} | Inverted geocoding - get address and coverage regions from coordinates|

# **coordsCoordGet**
> CoordsResponse coordsCoordGet()

Given coordinates, returns the detailed postal address and the Navitia coverage regions that contain these coordinates. The coordinate format is \'lon;lat\' (longitude;latitude).

### Example

```typescript
import {
    InvertedGeocodingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InvertedGeocodingApi(configuration);

let coord: string; //Coordinates in format \'lon;lat\' (longitude;latitude), e.g., \'2.37705;48.84675\' (default to undefined)

const { status, data } = await apiInstance.coordsCoordGet(
    coord
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coord** | [**string**] | Coordinates in format \&#39;lon;lat\&#39; (longitude;latitude), e.g., \&#39;2.37705;48.84675\&#39; | defaults to undefined|


### Return type

**CoordsResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Address and coverage regions information |  -  |
|**400** | Bad request (invalid coordinates format) |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

