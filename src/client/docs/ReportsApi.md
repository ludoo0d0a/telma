# ReportsApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageEquipmentReportsGet**](#coveragecoverageequipmentreportsget) | **GET** /coverage/{coverage}/equipment_reports | Get equipment reports|
|[**coverageCoverageLineReportsGet**](#coveragecoveragelinereportsget) | **GET** /coverage/{coverage}/line_reports | Get line reports|
|[**coverageCoverageLinesIdLineReportsGet**](#coveragecoveragelinesidlinereportsget) | **GET** /coverage/{coverage}/lines/{id}/line_reports | Get line reports for a specific line|
|[**coverageCoverageTrafficReportsGet**](#coveragecoveragetrafficreportsget) | **GET** /coverage/{coverage}/traffic_reports | Get traffic reports|

# **coverageCoverageEquipmentReportsGet**
> CoverageCoverageEquipmentReportsGet200Response coverageCoverageEquipmentReportsGet()


### Example

```typescript
import {
    ReportsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let filter: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageEquipmentReportsGet(
    coverage,
    filter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **filter** | [**string**] |  | (optional) defaults to undefined|


### Return type

**CoverageCoverageEquipmentReportsGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Equipment reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageLineReportsGet**
> CoverageCoverageLineReportsGet200Response coverageCoverageLineReportsGet()


### Example

```typescript
import {
    ReportsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let filter: string; // (default to undefined)

const { status, data } = await apiInstance.coverageCoverageLineReportsGet(
    coverage,
    filter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **filter** | [**string**] |  | defaults to undefined|


### Return type

**CoverageCoverageLineReportsGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Line reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageLinesIdLineReportsGet**
> CoverageCoverageLineReportsGet200Response coverageCoverageLinesIdLineReportsGet()


### Example

```typescript
import {
    ReportsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let id: string; //Line ID (default to undefined)

const { status, data } = await apiInstance.coverageCoverageLinesIdLineReportsGet(
    coverage,
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **id** | [**string**] | Line ID | defaults to undefined|


### Return type

**CoverageCoverageLineReportsGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Line reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageTrafficReportsGet**
> CoverageCoverageTrafficReportsGet200Response coverageCoverageTrafficReportsGet()


### Example

```typescript
import {
    ReportsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ReportsApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)

const { status, data } = await apiInstance.coverageCoverageTrafficReportsGet(
    coverage
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|


### Return type

**CoverageCoverageTrafficReportsGet200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Traffic reports |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

