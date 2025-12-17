# Navitia API Client

This directory contains a TypeScript API client generated from the OpenAPI specification.

## Generated Files

- **`api/`** - API endpoint classes organized by feature
- **`models/`** - TypeScript type definitions for all API models
- **`client.ts`** - Convenience wrapper for easy client initialization
- **`configuration.ts`** - Configuration class for API authentication and base URLs

## Usage

### Basic Usage

```typescript
import { NavitiaClient } from './client/client';

// Initialize the client
const client = new NavitiaClient({
  apiKey: process.env.VITE_API_KEY || 'your-api-key',
  basePath: 'https://api.sncf.com/v1', // optional, defaults to this
});

// Use the API
const journeys = await client.journeys.coverageCoverageJourneysGet(
  'sncf',
  'stop_area:SNCF:82006030',
  'stop_area:SNCF:87192039',
  '20251218T000000',
  undefined, // datetimeRepresents
  'realtime', // dataFreshness
  100 // count
);

console.log(journeys.data.journeys);
```

### Using Individual API Classes

```typescript
import { JourneysApi, Configuration } from './client';

const config = new Configuration({
  apiKey: process.env.VITE_API_KEY,
  basePath: 'https://api.sncf.com/v1',
});

const journeysApi = new JourneysApi(config);

const result = await journeysApi.coverageCoverageJourneysGet(
  'sncf',
  'stop_area:SNCF:82006030',
  'stop_area:SNCF:87192039'
);
```

### Using Types

```typescript
import type { Journey, Place, Departure } from './client/models';

function processJourney(journey: Journey) {
  // TypeScript will provide autocomplete and type checking
  console.log(journey.journeys[0].departure_date_time);
}
```

## Available API Classes

- `ArrivalsApi` - Get arrivals to stop areas
- `CoverageApi` - Get coverage information
- `DeparturesApi` - Get departures from stop areas
- `JourneysApi` - Plan journeys between points
- `PlacesApi` - Search for places
- `SchedulesApi` - Get stop, route, and terminus schedules
- `ReportsApi` - Get line, traffic, and equipment reports
- `IsochronesApi` - Calculate isochrones
- `TransportModesApi` - Get commercial and physical modes
- `PublicTransportObjectsApi` - Autocomplete on PT objects
- `ContributorsApi` - Get contributors information
- `DatasetsApi` - Get datasets information

## Regenerating the Client

If you update the OpenAPI specification (`public/openapi.json`), regenerate the client:

```bash
npm run generate-client
```

## Type Safety

All API methods and models are fully typed. TypeScript will:
- Provide autocomplete for all parameters
- Validate request/response types
- Catch type errors at compile time

## Examples

### Search for Places

```typescript
const places = await client.places.coverageCoveragePlacesGet(
  'sncf',
  'Bettembourg',
  20 // count
);

places.data.places.forEach(place => {
  console.log(place.name, place.embedded_type);
});
```

### Get Departures

```typescript
const departures = await client.departures.coverageCoverageStopAreasIdDeparturesGet(
  'sncf',
  'stop_area:SNCF:87391003',
  undefined, // datetime
  10, // count
  2 // depth
);

departures.data.departures.forEach(dep => {
  console.log(dep.display_informations?.headsign);
});
```

### Get Journeys with Real-time Data

```typescript
const journeys = await client.journeys.coverageCoverageJourneysGet(
  'sncf',
  'stop_area:SNCF:82006030',
  'stop_area:SNCF:87192039',
  '20251218T000000',
  'departure', // datetimeRepresents
  'realtime', // dataFreshness
  100 // count
);

journeys.data.journeys.forEach(journey => {
  console.log(`Duration: ${journey.durations?.total}s`);
  console.log(`Transfers: ${journey.nb_transfers}`);
});
```

## Notes

- All API methods return Axios promises
- The client uses axios for HTTP requests
- Authentication is handled via the `Authorization` header
- All models are exported from `./models` for use in your application

