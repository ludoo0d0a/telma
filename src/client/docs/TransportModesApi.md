# TransportModesApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageCommercialModesGet**](#coveragecoveragecommercialmodesget) | **GET** /coverage/{coverage}/commercial_modes | Get commercial transport modes|
|[**coverageCoveragePhysicalModesGet**](#coveragecoveragephysicalmodesget) | **GET** /coverage/{coverage}/physical_modes | Get physical transport modes|

# **coverageCoverageCommercialModesGet**
> CommercialModesResponse coverageCoverageCommercialModesGet()


### Example

```typescript
import {
    TransportModesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransportModesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageCommercialModesGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**CommercialModesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of commercial modes |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoveragePhysicalModesGet**
> PhysicalModesResponse coverageCoveragePhysicalModesGet()


### Example

```typescript
import {
    TransportModesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TransportModesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoveragePhysicalModesGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**PhysicalModesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of physical modes |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

