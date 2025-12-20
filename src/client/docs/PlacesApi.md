# PlacesApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageCoordCoordAddressesGet**](#coveragecoveragecoordcoordaddressesget) | **GET** /coverage/{coverage}/coord/{coord}/addresses | Inverted geocoding - get address from coordinates|
|[**coverageCoverageCoordCoordFreefloatingsGet**](#coveragecoveragecoordcoordfreefloatingsget) | **GET** /coverage/{coverage}/coord/{coord}/freefloatings | Get freefloatings nearby coordinates|
|[**coverageCoverageCoordCoordPlacesNearbyGet**](#coveragecoveragecoordcoordplacesnearbyget) | **GET** /coverage/{coverage}/coord/{coord}/places_nearby | Find places nearby coordinates|
|[**coverageCoveragePlacesGet**](#coveragecoverageplacesget) | **GET** /coverage/{coverage}/places | Search for places (geographical autocomplete)|

# **coverageCoverageCoordCoordAddressesGet**
> PlacesResponse coverageCoverageCoordCoordAddressesGet()


### Example

```typescript
import {
    PlacesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlacesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let coord: string; //Coordinates in format \'lon;lat\' (default to undefined)

const { status, data } = await apiInstance.coverageCoverageCoordCoordAddressesGet(
    coverage,
    coord
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **coord** | [**string**] | Coordinates in format \&#39;lon;lat\&#39; | defaults to undefined|


### Return type

**PlacesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of addresses |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageCoordCoordFreefloatingsGet**
> CoverageCoverageCoordCoordFreefloatingsGet200Response coverageCoverageCoordCoordFreefloatingsGet()


### Example

```typescript
import {
    PlacesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlacesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let coord: string; //Coordinates in format \'lon;lat\' (default to undefined)
let distance: number; //Distance in meters (optional) (default to 200)

const { status, data } = await apiInstance.coverageCoverageCoordCoordFreefloatingsGet(
    coverage,
    coord,
    distance
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **coord** | [**string**] | Coordinates in format \&#39;lon;lat\&#39; | defaults to undefined|
| **distance** | [**number**] | Distance in meters | (optional) defaults to 200|


### Return type

**CoverageCoverageCoordCoordFreefloatingsGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of freefloatings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageCoordCoordPlacesNearbyGet**
> PlacesResponse coverageCoverageCoordCoordPlacesNearbyGet()

Find places (stop areas, stop points, addresses, POIs) within a certain distance from coordinates

### Example

```typescript
import {
    PlacesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlacesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let coord: string; //Coordinates in format \'lon;lat\' (default to undefined)
let distance: number; //Distance in meters (default: 200) (optional) (default to 200)
let type: Array<'stop_area' | 'stop_point' | 'address' | 'poi' | 'administrative_region'>; //Filter by place types (optional) (default to undefined)
let count: number; //Number of results to return (optional) (default to 10)
let depth: number; //Depth of detail in response (optional) (default to 1)

const { status, data } = await apiInstance.coverageCoverageCoordCoordPlacesNearbyGet(
    coverage,
    coord,
    distance,
    type,
    count,
    depth
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **coord** | [**string**] | Coordinates in format \&#39;lon;lat\&#39; | defaults to undefined|
| **distance** | [**number**] | Distance in meters (default: 200) | (optional) defaults to 200|
| **type** | **Array<&#39;stop_area&#39; &#124; &#39;stop_point&#39; &#124; &#39;address&#39; &#124; &#39;poi&#39; &#124; &#39;administrative_region&#39;>** | Filter by place types | (optional) defaults to undefined|
| **count** | [**number**] | Number of results to return | (optional) defaults to 10|
| **depth** | [**number**] | Depth of detail in response | (optional) defaults to 1|


### Return type

**PlacesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of nearby places |  -  |
|**400** | Bad request (e.g., invalid coordinates format) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoveragePlacesGet**
> PlacesResponse coverageCoveragePlacesGet()

Search for places including stop areas, stop points, addresses, POIs, and administrative regions

### Example

```typescript
import {
    PlacesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlacesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let q: string; //Search query (minimum 2 characters) (default to undefined)
let count: number; //Number of results to return (optional) (default to 10)
let type: Array<'stop_area' | 'stop_point' | 'address' | 'poi' | 'administrative_region'>; //Filter by place types (optional) (default to undefined)
let depth: number; //Depth of detail in response (optional) (default to 1)

const { status, data } = await apiInstance.coverageCoveragePlacesGet(
    coverage,
    q,
    count,
    type,
    depth
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **q** | [**string**] | Search query (minimum 2 characters) | defaults to undefined|
| **count** | [**number**] | Number of results to return | (optional) defaults to 10|
| **type** | **Array<&#39;stop_area&#39; &#124; &#39;stop_point&#39; &#124; &#39;address&#39; &#124; &#39;poi&#39; &#124; &#39;administrative_region&#39;>** | Filter by place types | (optional) defaults to undefined|
| **depth** | [**number**] | Depth of detail in response | (optional) defaults to 1|


### Return type

**PlacesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of matching places |  -  |
|**400** | Bad request (e.g., query too short) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

