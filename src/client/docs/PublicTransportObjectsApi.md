# PublicTransportObjectsApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageLinesGet**](#coveragecoveragelinesget) | **GET** /coverage/{coverage}/lines | List all lines|
|[**coverageCoverageNetworksGet**](#coveragecoveragenetworksget) | **GET** /coverage/{coverage}/networks | List all networks|
|[**coverageCoveragePtObjectsGet**](#coveragecoverageptobjectsget) | **GET** /coverage/{coverage}/pt_objects | Autocomplete on Public Transport objects|
|[**coverageCoverageRoutesGet**](#coveragecoverageroutesget) | **GET** /coverage/{coverage}/routes | List all routes|
|[**coverageCoverageStopAreasGet**](#coveragecoveragestopareasget) | **GET** /coverage/{coverage}/stop_areas | List all stop areas|
|[**coverageCoverageStopPointsGet**](#coveragecoveragestoppointsget) | **GET** /coverage/{coverage}/stop_points | List all stop points|
|[**coverageCoverageVehicleJourneysIdGet**](#coveragecoveragevehiclejourneysidget) | **GET** /coverage/{coverage}/vehicle_journeys/{id} | Get vehicle journey details|

# **coverageCoverageLinesGet**
> LinesResponse coverageCoverageLinesGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageLinesGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**LinesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of lines |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageNetworksGet**
> CoverageCoverageNetworksGet200Response coverageCoverageNetworksGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageNetworksGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**CoverageCoverageNetworksGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of networks |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoveragePtObjectsGet**
> PlacesResponse coverageCoveragePtObjectsGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let q: string; //Search query (default to undefined)
let count: number; //Number of results to return (optional) (default to 10)

const { status, data } = await apiInstance.coverageCoveragePtObjectsGet(
    coverage,
    q,
    count
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **q** | [**string**] | Search query | defaults to undefined|
| **count** | [**number**] | Number of results to return | (optional) defaults to 10|


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
|**200** | List of PT objects |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageRoutesGet**
> CoverageCoverageRoutesGet200Response coverageCoverageRoutesGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageRoutesGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**CoverageCoverageRoutesGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of routes |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageStopAreasGet**
> StopAreasResponse coverageCoverageStopAreasGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageStopAreasGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**StopAreasResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of stop areas |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageStopPointsGet**
> CoverageCoverageStopPointsGet200Response coverageCoverageStopPointsGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageStopPointsGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**CoverageCoverageStopPointsGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of stop points |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageVehicleJourneysIdGet**
> VehicleJourneysResponse coverageCoverageVehicleJourneysIdGet()


### Example

```typescript
import {
    PublicTransportObjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PublicTransportObjectsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let id: string; //Vehicle journey ID (default to undefined)

const { status, data } = await apiInstance.coverageCoverageVehicleJourneysIdGet(
    coverage,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **id** | [**string**] | Vehicle journey ID | defaults to undefined|


### Return type

**VehicleJourneysResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Vehicle journey details |  -  |
|**404** | Vehicle journey not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

