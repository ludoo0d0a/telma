# IsochronesApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageIsochronesGet**](#coveragecoverageisochronesget) | **GET** /coverage/{coverage}/isochrones | Calculate isochrones (Beta)|

# **coverageCoverageIsochronesGet**
> CoverageCoverageIsochronesGet200Response coverageCoverageIsochronesGet()


### Example

```typescript
import {
    IsochronesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IsochronesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let from: string; // (default to undefined)
let maxDuration: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageIsochronesGet(
    coverage,
    from,
    maxDuration
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **from** | [**string**] |  | defaults to undefined|
| **maxDuration** | [**number**] |  | (optional) defaults to undefined|


### Return type

**CoverageCoverageIsochronesGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Isochrone data |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

