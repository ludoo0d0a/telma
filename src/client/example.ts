/**
 * Example usage of the Navitia API Client
 * 
 * This file demonstrates how to use the generated TypeScript client.
 * Note: This is a TypeScript file for demonstration. In your JavaScript files,
 * you can import and use the client the same way, but without type annotations.
 */

import { NavitiaClient } from './client';
import type { Journey, Place, Departure } from './models';

// Example 1: Initialize the client
export function createClient(apiKey: string): NavitiaClient {
  return new NavitiaClient({
    apiKey: apiKey,
    basePath: 'https://api.sncf.com/v1',
  });
}

// Example 2: Search for places
export async function searchPlacesExample(client: NavitiaClient, query: string) {
  try {
    const response = await client.places.coverageCoveragePlacesGet(
      'sncf',
      query,
      20 // count
    );
    
    const places: Place[] = response.data.places || [];
    return places.filter(place => 
      place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
    );
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

// Example 3: Get journeys
export async function getJourneysExample(
  client: NavitiaClient,
  from: string,
  to: string,
  datetime?: string
) {
  try {
    const response = await client.journeys.coverageCoverageJourneysGet(
      'sncf',
      from,
      to,
      datetime,
      'departure', // datetimeRepresents
      'realtime', // dataFreshness
      100 // count
    );
    
    const journey: Journey = response.data;
    return journey.journeys || [];
  } catch (error) {
    console.error('Error getting journeys:', error);
    throw error;
  }
}

// Example 4: Get departures
export async function getDeparturesExample(
  client: NavitiaClient,
  stopAreaId: string,
  count: number = 10
) {
  try {
    const response = await client.departures.coverageCoverageStopAreasIdDeparturesGet(
      'sncf',
      stopAreaId,
      undefined, // datetime
      count,
      2 // depth
    );
    
    const departures: Departure[] = response.data.departures || [];
    return departures;
  } catch (error) {
    console.error('Error getting departures:', error);
    throw error;
  }
}

// Example 5: Get arrivals
export async function getArrivalsExample(
  client: NavitiaClient,
  stopAreaId: string,
  count: number = 10
) {
  try {
    const response = await client.arrivals.coverageCoverageStopAreasIdArrivalsGet(
      'sncf',
      stopAreaId,
      undefined, // datetime
      count,
      2 // depth
    );
    
    return response.data.arrivals || [];
  } catch (error) {
    console.error('Error getting arrivals:', error);
    throw error;
  }
}

// Example 6: Get stop schedules
export async function getStopSchedulesExample(
  client: NavitiaClient,
  filter: string,
  datetime?: string
) {
  try {
    const response = await client.schedules.coverageCoverageStopSchedulesGet(
      'sncf',
      filter,
      datetime
    );
    
    return response.data.stop_schedules || [];
  } catch (error) {
    console.error('Error getting stop schedules:', error);
    throw error;
  }
}

