# Disruption


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | Disruption ID | [optional] [default to undefined]
**disruption_id** | **string** | Disruption ID | [optional] [default to undefined]
**disruption_uri** | **string** | Disruption URI | [optional] [default to undefined]
**severity** | [**Severity**](Severity.md) |  | [optional] [default to undefined]
**impact_id** | **string** | Impact ID | [optional] [default to undefined]
**application_periods** | [**Array&lt;ImpactApplicationPeriodsInner&gt;**](ImpactApplicationPeriodsInner.md) |  | [optional] [default to undefined]
**status** | **string** | Disruption status (e.g., active, future, past) | [optional] [default to undefined]
**updated_at** | **string** | Last update datetime (YYYYMMDDTHHmmss) | [optional] [default to undefined]
**uri** | **string** | Disruption URI (may duplicate disruption_uri) | [optional] [default to undefined]
**contributor** | **string** | Contributor/source of this disruption | [optional] [default to undefined]
**messages** | [**Array&lt;DisruptionMessagesInner&gt;**](DisruptionMessagesInner.md) |  | [optional] [default to undefined]
**impacted_objects** | [**Array&lt;Impact&gt;**](Impact.md) |  | [optional] [default to undefined]
**cause** | **string** | Disruption cause | [optional] [default to undefined]
**message** | **string** | Single disruption message (legacy/alternate field) | [optional] [default to undefined]
**category** | **string** | Disruption category | [optional] [default to undefined]

## Example

```typescript
import { Disruption } from './api';

const instance: Disruption = {
    id,
    disruption_id,
    disruption_uri,
    severity,
    impact_id,
    application_periods,
    status,
    updated_at,
    uri,
    contributor,
    messages,
    impacted_objects,
    cause,
    message,
    category,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
