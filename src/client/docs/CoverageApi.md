# CoverageApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageGet**](#coveragecoverageget) | **GET** /coverage/{coverage} | Get coverage area details|
|[**coverageGet**](#coverageget) | **GET** /coverage | List all available coverage areas|

# **coverageCoverageGet**
> Coverage coverageCoverageGet()


### Example

```typescript
import {
    CoverageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoverageApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**Coverage**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Coverage area information |  -  |
|**404** | Coverage not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageGet**
> CoverageResponse coverageGet()


### Example

```typescript
import {
    CoverageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoverageApi(configuration);

const { status, data } = await apiInstance.coverageGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**CoverageResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of coverage areas |  -  |
|**401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

