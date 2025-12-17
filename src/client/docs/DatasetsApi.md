# DatasetsApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageDatasetsGet**](#coveragecoveragedatasetsget) | **GET** /coverage/{coverage}/datasets | Get datasets information|

# **coverageCoverageDatasetsGet**
> DatasetsResponse coverageCoverageDatasetsGet()


### Example

```typescript
import {
    DatasetsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageDatasetsGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**DatasetsResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of datasets |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

