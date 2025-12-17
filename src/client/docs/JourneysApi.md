# JourneysApi

All URIs are relative to *https://api.sncf.com/v1*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**coverageCoverageJourneysGet**](#coveragecoveragejourneysget) | **GET** /coverage/{coverage}/journeys | Plan a journey between two points|

# **coverageCoverageJourneysGet**
> Journey coverageCoverageJourneysGet()


### Example

```typescript
import {
    JourneysApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new JourneysApi(configuration);

let coverage: string; //Coverage area (e.g., \'sncf\') (default to undefined)
let from: string; //Origin location ID (default to undefined)
let to: string; //Destination location ID (default to undefined)
let datetime: string; //Date and time in format YYYYMMDDTHHmmss (optional) (default to undefined)
let datetimeRepresents: 'departure' | 'arrival'; //Whether datetime represents departure or arrival (optional) (default to undefined)
let dataFreshness: 'base_schedule' | 'realtime'; //Data freshness: base_schedule or realtime (optional) (default to 'base_schedule')
let count: number; //Number of results to return (optional) (default to 10)
let maxDuration: number; //Maximum journey duration in seconds (optional) (default to undefined)
let minNbJourneys: number; //Minimum number of journeys to return (optional) (default to 1)
let timeframeDuration: number; //Timeframe duration in seconds (optional) (default to 86400)

const { status, data } = await apiInstance.coverageCoverageJourneysGet(
    coverage,
    from,
    to,
    datetime,
    datetimeRepresents,
    dataFreshness,
    count,
    maxDuration,
    minNbJourneys,
    timeframeDuration
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **coverage** | [**string**] | Coverage area (e.g., \&#39;sncf\&#39;) | defaults to undefined|
| **from** | [**string**] | Origin location ID | defaults to undefined|
| **to** | [**string**] | Destination location ID | defaults to undefined|
| **datetime** | [**string**] | Date and time in format YYYYMMDDTHHmmss | (optional) defaults to undefined|
| **datetimeRepresents** | [**&#39;departure&#39; | &#39;arrival&#39;**]**Array<&#39;departure&#39; &#124; &#39;arrival&#39;>** | Whether datetime represents departure or arrival | (optional) defaults to undefined|
| **dataFreshness** | [**&#39;base_schedule&#39; | &#39;realtime&#39;**]**Array<&#39;base_schedule&#39; &#124; &#39;realtime&#39;>** | Data freshness: base_schedule or realtime | (optional) defaults to 'base_schedule'|
| **count** | [**number**] | Number of results to return | (optional) defaults to 10|
| **maxDuration** | [**number**] | Maximum journey duration in seconds | (optional) defaults to undefined|
| **minNbJourneys** | [**number**] | Minimum number of journeys to return | (optional) defaults to 1|
| **timeframeDuration** | [**number**] | Timeframe duration in seconds | (optional) defaults to 86400|


### Return type

**Journey**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of journey options |  -  |
|**404** | Origin or destination not found, or no solution |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

