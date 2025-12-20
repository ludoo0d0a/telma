# DisruptionsApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageDisruptionsGet**](#coveragecoveragedisruptionsget) | **GET** /coverage/{coverage}/disruptions | List disruptions|

# **coverageCoverageDisruptionsGet**
> DisruptionsResponse coverageCoverageDisruptionsGet()

Get a list of disruptions. Can be filtered by since/until dates.

### Example

```typescript
import {
    DisruptionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DisruptionsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let since: string; //Filter disruptions since this datetime (YYYYMMDDTHHmmss) (optional) (default to undefined)
let until: string; //Filter disruptions until this datetime (YYYYMMDDTHHmmss) (optional) (default to undefined)
let depth: number; //Depth of detail in response (optional) (default to 1)

const { status, data } = await apiInstance.coverageCoverageDisruptionsGet(
    coverage,
    since,
    until,
    depth
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **since** | [**string**] | Filter disruptions since this datetime (YYYYMMDDTHHmmss) | (optional) defaults to undefined|
| **until** | [**string**] | Filter disruptions until this datetime (YYYYMMDDTHHmmss) | (optional) defaults to undefined|
| **depth** | [**number**] | Depth of detail in response | (optional) defaults to 1|


### Return type

**DisruptionsResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of disruptions |  -  |
|**401** | Unauthorized |  -  |
|**404** | Coverage not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

