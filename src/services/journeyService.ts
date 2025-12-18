import type { JourneyItem } from '../client/models/journey-item';
import { getTransportIcon, getWagonCount } from './transportService';
import { cleanLocationName } from './locationService';

export interface JourneyInfo {
    trainNumber: string;
    vehicleJourneyId: string | null;
    commercialMode: string;
    network: string;
    transportIcon: string;
    transportColor: string;
    transportTagColor: string;
    transportLabel: string;
    wagonCount: number | string | null;
    departureStation: string | null | undefined;
    arrivalStation: string | null | undefined;
    departureTime: string;
    arrivalTime: string;
    baseDepartureTime: string;
    baseArrivalTime: string;
    realDepartureTime: string;
    realArrivalTime: string;
    duration: number;
    sections: any[];
}

/**
 * Get journey information from a journey object
 */
export const getJourneyInfo = (journey: JourneyItem, fromName: string | null = null, toName: string | null = null): JourneyInfo => {
    const firstSection = journey.sections?.find((s: any) => s.type === 'public_transport');
    const lastSection = journey.sections?.slice().reverse().find((s: any) => s.type === 'public_transport');
    
    const commercialMode = firstSection?.display_informations?.commercial_mode || '';
    const network = firstSection?.display_informations?.network || '';
    const transportInfo = getTransportIcon(commercialMode, network);
    
    // Try to get wagon count
    const wagonCount = getWagonCount(firstSection);
    
    // Extract vehicle journey ID from first section
    let vehicleJourneyId: string | null = null;
    if (firstSection) {
        // Try from vehicle_journey.id (ensure we get the ID string, not the object)
        if (firstSection.vehicle_journey) {
            // If vehicle_journey is a string (ID), use it directly
            if (typeof firstSection.vehicle_journey === 'string') {
                vehicleJourneyId = firstSection.vehicle_journey;
            }
            // If vehicle_journey is an object, extract the ID
            else if (firstSection.vehicle_journey.id) {
                vehicleJourneyId = firstSection.vehicle_journey.id;
            }
        }
        // Try from links (similar to Departures/Arrivals)
        if (!vehicleJourneyId && firstSection.links && firstSection.links.length > 0) {
            const vehicleJourneyLink = firstSection.links.find((link: any) => 
                link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
            );
            if (vehicleJourneyLink) {
                vehicleJourneyId = vehicleJourneyLink.id;
            }
        }
        // Try from trip.vehicle_journey
        if (!vehicleJourneyId && firstSection.trip?.vehicle_journey) {
            // If trip.vehicle_journey is a string (ID), use it directly
            if (typeof firstSection.trip.vehicle_journey === 'string') {
                vehicleJourneyId = firstSection.trip.vehicle_journey;
            }
            // If trip.vehicle_journey is an object, extract the ID
            else if (firstSection.trip.vehicle_journey.id) {
                vehicleJourneyId = firstSection.trip.vehicle_journey.id;
            }
        }
    }
    
    return {
        trainNumber: firstSection?.display_informations?.headsign || 
                     firstSection?.display_informations?.trip_short_name || 
                     'N/A',
        vehicleJourneyId: vehicleJourneyId,
        commercialMode: commercialMode || 'Train',
        network: network,
        transportIcon: transportInfo.icon,
        transportColor: transportInfo.color,
        transportTagColor: transportInfo.tagColor,
        transportLabel: transportInfo.label,
        wagonCount: wagonCount,
        departureStation: cleanLocationName(
            firstSection?.from?.stop_point?.name || 
            firstSection?.from?.stop_area?.name || 
            fromName || 'Départ'
        ),
        arrivalStation: cleanLocationName(
            lastSection?.to?.stop_point?.name || 
            lastSection?.to?.stop_area?.name || 
            toName || 'Arrivée'
        ),
        departureTime: journey.departure_date_time,
        arrivalTime: journey.arrival_date_time,
        baseDepartureTime: firstSection?.base_departure_date_time || journey.departure_date_time,
        baseArrivalTime: lastSection?.base_arrival_date_time || journey.arrival_date_time,
        realDepartureTime: firstSection?.departure_date_time || journey.departure_date_time,
        realArrivalTime: lastSection?.arrival_date_time || journey.arrival_date_time,
        duration: journey.durations?.total || 0,
        sections: journey.sections || []
    };
}

