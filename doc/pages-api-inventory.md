# Pages API Inventory

Compact inventory of pages with API URLs used in each page.

**Base URL:** `https://api.sncf.com/v1`  
**Default Coverage:** `sncf`

## Pages

### Home (`/`)
- **No API calls** - Navigation dashboard only

### About (`/about`)
- **No API calls** - Static information page

### City (`/city/:city`)
- **No direct API calls** - Uses `TrainStation` component
  - **TrainStation component:**
    - `GET /coverage/{coverage}/stop_areas/{id}/departures` (via Departures component)
    - `GET /coverage/{coverage}/stop_areas/{id}/arrivals` (via Arrivals component)

### CommercialModes (`/commercial-modes`)
- `GET /coverage/{coverage}/commercial_modes`

### Coverage (`/coverage`)
- `GET /coverage`
- `GET /coverage/{coverage}`

### Favorites (`/favorites`)
- **No API calls** - Local storage only

### Isochrones (`/isochrones`)
- `GET /coverage/{coverage}/isochrones`

### Lines (`/lines`)
- `GET /coverage/{coverage}/lines`

### Places (`/places`)
- `GET /coverage/{coverage}/places` (text search)
- `GET /coverage/{coverage}/places_nearby` (coordinate search)

### Reports (`/reports`)
- `GET /coverage/{coverage}/line_reports`
- `GET /coverage/{coverage}/traffic_reports`
- `GET /coverage/{coverage}/equipment_reports`

### Schedules (`/schedules`)
- `GET /coverage/{coverage}/stop_schedules`
- `GET /coverage/{coverage}/route_schedules`
- `GET /coverage/{coverage}/terminus_schedules`

### SwaggerUI (`/api-docs`)
- `GET /openapi.json` (static file, not API endpoint)

### Train (`/train`, `/train/:id`)
- `GET /coverage/{coverage}/pt_objects` (autocomplete search)
- `GET /coverage/{coverage}/vehicle_journeys/{id}`

### Trajet (`/itinerary`, `/itinerary/:from/:to`)
- `GET /coverage/{coverage}/journeys`

### Trip (`/trip/:tripId`)
- `GET /coverage/{coverage}/vehicle_journeys/{id}`

## Components with API Calls

### LocationAutocomplete (used in Trajet)
- `GET /coverage/{coverage}/places` (text search)
- `GET /coverage/{coverage}/places_nearby` (coordinate search)

### Departures (used in TrainStation)
- `GET /coverage/{coverage}/stop_areas/{id}/departures`

### Arrivals (used in TrainStation)
- `GET /coverage/{coverage}/stop_areas/{id}/arrivals`

