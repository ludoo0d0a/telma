# Impact


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**severity** | [**Severity**](Severity.md) |  | [optional] [default to undefined]
**application_periods** | [**Array&lt;ImpactApplicationPeriodsInner&gt;**](ImpactApplicationPeriodsInner.md) |  | [optional] [default to undefined]
**pt_object** | [**ImpactPtObject**](ImpactPtObject.md) |  | [optional] [default to undefined]
**impacted_stops** | [**Array&lt;ImpactImpactedStopsInner&gt;**](ImpactImpactedStopsInner.md) | List of impacted stops | [optional] [default to undefined]
**object** | **object** | Affected object (deprecated, use pt_object) | [optional] [default to undefined]
**object_type** | **string** | Affected object type (deprecated, use pt_object.embedded_type) | [optional] [default to undefined]

## Example

```typescript
import { Impact } from './api';

const instance: Impact = {
    severity,
    application_periods,
    pt_object,
    impacted_stops,
    object,
    object_type,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
