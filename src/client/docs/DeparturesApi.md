# DeparturesApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageStopAreasIdDeparturesGet**](#coveragecoveragestopareasiddeparturesget) | **GET** /coverage/{coverage}/stop_areas/{id}/departures | Get next departures from a stop area|

# **coverageCoverageStopAreasIdDeparturesGet**
> DeparturesResponse coverageCoverageStopAreasIdDeparturesGet()


### Example

```typescript
import {
    DeparturesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeparturesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let id: string; // (default to undefined)
let datetime: string; //Date and time in format YYYYMMDDTHHmmss (optional) (default to undefined)
let count: number; //Number of results to return (optional) (default to 10)
let depth: number; //Depth of detail in response (optional) (default to 1)

const { status, data } = await apiInstance.coverageCoverageStopAreasIdDeparturesGet(
    coverage,
    id,
    datetime,
    count,
    depth
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **id** | [**string**] |  | defaults to undefined|
| **datetime** | [**string**] | Date and time in format YYYYMMDDTHHmmss | (optional) defaults to undefined|
| **count** | [**number**] | Number of results to return | (optional) defaults to 10|
| **depth** | [**number**] | Depth of detail in response | (optional) defaults to 1|


### Return type

**DeparturesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of departures |  -  |
|**404** | Stop area not found or no departures |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

