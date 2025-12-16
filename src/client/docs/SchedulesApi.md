# SchedulesApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoveragePhysicalModesPhysicalModeLinesLineStopAreasStopAreaTerminusSchedulesGet**](#coveragecoveragephysicalmodesphysicalmodelineslinestopareasstopareaterminusschedulesget) | **GET** /coverage/{coverage}/physical_modes/{physical_mode}/lines/{line}/stop_areas/{stop_area}/terminus_schedules | Get terminus schedules for a specific line and stop area|
|[**coverageCoverageRouteSchedulesGet**](#coveragecoveragerouteschedulesget) | **GET** /coverage/{coverage}/route_schedules | Get route schedules|
|[**coverageCoverageRoutesIdRouteSchedulesGet**](#coveragecoverageroutesidrouteschedulesget) | **GET** /coverage/{coverage}/routes/{id}/route_schedules | Get route schedules for a specific route|
|[**coverageCoverageStopPointsIdStopSchedulesGet**](#coveragecoveragestoppointsidstopschedulesget) | **GET** /coverage/{coverage}/stop_points/{id}/stop_schedules | Get stop schedules for a specific stop point|
|[**coverageCoverageStopSchedulesGet**](#coveragecoveragestopschedulesget) | **GET** /coverage/{coverage}/stop_schedules | Get stop schedules|
|[**coverageCoverageTerminusSchedulesGet**](#coveragecoverageterminusschedulesget) | **GET** /coverage/{coverage}/terminus_schedules | Get terminus schedules|

# **coverageCoveragePhysicalModesPhysicalModeLinesLineStopAreasStopAreaTerminusSchedulesGet**
> TerminusSchedulesResponse coverageCoveragePhysicalModesPhysicalModeLinesLineStopAreasStopAreaTerminusSchedulesGet()


### Example

```typescript
import {
    SchedulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let physicalMode: string; //Physical mode ID (default to undefined)
let line: string; //Line ID (default to undefined)
let stopArea: string; //Stop area ID (default to undefined)
let fromDatetime: string; //From date and time (YYYYMMDDTHHmmss) (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoveragePhysicalModesPhysicalModeLinesLineStopAreasStopAreaTerminusSchedulesGet(
    coverage,
    physicalMode,
    line,
    stopArea,
    fromDatetime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **physicalMode** | [**string**] | Physical mode ID | defaults to undefined|
| **line** | [**string**] | Line ID | defaults to undefined|
| **stopArea** | [**string**] | Stop area ID | defaults to undefined|
| **fromDatetime** | [**string**] | From date and time (YYYYMMDDTHHmmss) | (optional) defaults to undefined|


### Return type

**TerminusSchedulesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Terminus schedules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageRouteSchedulesGet**
> RouteSchedulesResponse coverageCoverageRouteSchedulesGet()


### Example

```typescript
import {
    SchedulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let filter: string; //Filter (e.g., \'line.id=xxx\') (default to undefined)
let datetime: string; //Date and time in format YYYYMMDDTHHmmss (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageRouteSchedulesGet(
    coverage,
    filter,
    datetime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **filter** | [**string**] | Filter (e.g., \&#39;line.id&#x3D;xxx\&#39;) | defaults to undefined|
| **datetime** | [**string**] | Date and time in format YYYYMMDDTHHmmss | (optional) defaults to undefined|


### Return type

**RouteSchedulesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Route schedules |  -  |
|**404** | Route not found or no schedules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageRoutesIdRouteSchedulesGet**
> RouteSchedulesResponse coverageCoverageRoutesIdRouteSchedulesGet()


### Example

```typescript
import {
    SchedulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let id: string; //Route ID (default to undefined)
let fromDatetime: string; //From date and time (YYYYMMDDTHHmmss) (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageRoutesIdRouteSchedulesGet(
    coverage,
    id,
    fromDatetime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **id** | [**string**] | Route ID | defaults to undefined|
| **fromDatetime** | [**string**] | From date and time (YYYYMMDDTHHmmss) | (optional) defaults to undefined|


### Return type

**RouteSchedulesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Route schedules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageStopPointsIdStopSchedulesGet**
> StopSchedulesResponse coverageCoverageStopPointsIdStopSchedulesGet()


### Example

```typescript
import {
    SchedulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let id: string; //Stop point ID (default to undefined)
let fromDatetime: string; //From date and time (YYYYMMDDTHHmmss) (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageStopPointsIdStopSchedulesGet(
    coverage,
    id,
    fromDatetime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **id** | [**string**] | Stop point ID | defaults to undefined|
| **fromDatetime** | [**string**] | From date and time (YYYYMMDDTHHmmss) | (optional) defaults to undefined|


### Return type

**StopSchedulesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Stop schedules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageStopSchedulesGet**
> StopSchedulesResponse coverageCoverageStopSchedulesGet()


### Example

```typescript
import {
    SchedulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let filter: string; //Filter (e.g., \'stop_area.id=xxx\') (default to undefined)
let datetime: string; //Date and time in format YYYYMMDDTHHmmss (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageStopSchedulesGet(
    coverage,
    filter,
    datetime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **filter** | [**string**] | Filter (e.g., \&#39;stop_area.id&#x3D;xxx\&#39;) | defaults to undefined|
| **datetime** | [**string**] | Date and time in format YYYYMMDDTHHmmss | (optional) defaults to undefined|


### Return type

**StopSchedulesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Stop schedules |  -  |
|**404** | Stop not found or no schedules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **coverageCoverageTerminusSchedulesGet**
> TerminusSchedulesResponse coverageCoverageTerminusSchedulesGet()


### Example

```typescript
import {
    SchedulesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SchedulesApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let filter: string; //Filter (default to undefined)
let datetime: string; //Date and time in format YYYYMMDDTHHmmss (optional) (default to undefined)

const { status, data } = await apiInstance.coverageCoverageTerminusSchedulesGet(
    coverage,
    filter,
    datetime
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **filter** | [**string**] | Filter | defaults to undefined|
| **datetime** | [**string**] | Date and time in format YYYYMMDDTHHmmss | (optional) defaults to undefined|


### Return type

**TerminusSchedulesResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Terminus schedules |  -  |
|**404** | Line or stop area not found, or no schedules |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

