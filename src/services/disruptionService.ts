import type { Disruption } from '@/client/models/disruption';
import type { Impact } from '@/client/models/impact';

/**
 * Match disruptions by trip ID using impacted_objects.pt_object.trip
 */
export const matchDisruptionsByTrip = (
    disruptions: Disruption[],
    tripId: string | null | undefined
): Disruption[] => {
    if (!tripId || !disruptions || disruptions.length === 0) return [];
    
    return disruptions.filter((disruption: Disruption) => {
        if (!disruption.impacted_objects || !Array.isArray(disruption.impacted_objects)) {
            return false;
        }
        
        return disruption.impacted_objects.some((obj: Impact) => {
            const ptObject = obj.pt_object;
            if (!ptObject) return false;
            
            // Match using pt_object.trip.id
            if (ptObject.trip?.id && ptObject.trip.id === tripId) {
                return true;
            }
            
            // Match using embedded_type === 'trip' and pt_object.id
            if (ptObject.embedded_type === 'trip' && ptObject.id === tripId) {
                return true;
            }
            
            return false;
        });
    });
};

/**
 * Match disruptions by stop point ID using impacted_objects.pt_object
 */
export const matchDisruptionsByStopPoint = (
    disruptions: Disruption[],
    stopPointId: string | null | undefined
): Disruption[] => {
    if (!stopPointId || !disruptions || disruptions.length === 0) return [];
    
    return disruptions.filter((disruption: Disruption) => {
        if (!disruption.impacted_objects || !Array.isArray(disruption.impacted_objects)) {
            return false;
        }
        
        return disruption.impacted_objects.some((obj: Impact) => {
            const ptObject = obj.pt_object;
            if (!ptObject) return false;
            
            // Match by stop_point embedded_type
            if (ptObject.embedded_type === 'stop_point' && ptObject.id === stopPointId) {
                return true;
            }
            
            return false;
        });
    });
};

/**
 * Match disruptions by links (disruption links in departure/arrival/journey sections)
 */
export const matchDisruptionsByLinks = (
    disruptions: Disruption[],
    disruptionLinkIds: string[]
): Disruption[] => {
    if (!disruptionLinkIds || disruptionLinkIds.length === 0 || !disruptions || disruptions.length === 0) {
        return [];
    }
    
    return disruptions.filter((disruption: Disruption) => {
        const disruptionId = disruption.disruption_uri || disruption.id || disruption.disruption_id;
        return disruptionId && disruptionLinkIds.includes(disruptionId);
    });
};

/**
 * Deduplicate disruptions array
 */
export const deduplicateDisruptions = (disruptions: Disruption[]): Disruption[] => {
    return disruptions.filter((disruption, index, self) => 
        index === self.findIndex(d => 
            (d.id && disruption.id && d.id === disruption.id) ||
            (d.disruption_id && disruption.disruption_id && d.disruption_id === disruption.disruption_id) ||
            (d.disruption_uri && disruption.disruption_uri && d.disruption_uri === disruption.disruption_uri)
        )
    );
};

/**
 * Match disruptions for departures/arrivals using all available methods:
 * - Links (disruption links)
 * - Trip (impacted_objects.pt_object.trip)
 * - Stop point (impacted_objects.pt_object with embedded_type === 'stop_point')
 */
export const matchDisruptionsForDepartureArrival = (
    allDisruptions: Disruption[],
    disruptionLinks: Array<{ id?: string }>,
    tripId: string | null | undefined,
    stopPointId: string | null | undefined
): Disruption[] => {
    if (!allDisruptions || allDisruptions.length === 0) return [];
    
    // Match by links
    const disruptionLinkIds = disruptionLinks
        .map(link => link.id)
        .filter((id): id is string => Boolean(id));
    const matchedByLink = matchDisruptionsByLinks(allDisruptions, disruptionLinkIds);
    
    // Match by trip
    const matchedByTrip = matchDisruptionsByTrip(allDisruptions, tripId);
    
    // Match by stop point
    const matchedByStopPoint = matchDisruptionsByStopPoint(allDisruptions, stopPointId);
    
    // Combine all matches and deduplicate
    const allMatched = [...matchedByLink, ...matchedByTrip, ...matchedByStopPoint];
    return deduplicateDisruptions(allMatched);
};

/**
 * Check if a disruption matches a journey section by trip using impacted_objects.pt_object.trip
 */
export const doesDisruptionMatchSectionByTrip = (
    disruption: Disruption,
    sectionTripId: string | null | undefined
): boolean => {
    if (!sectionTripId || !disruption.impacted_objects || !Array.isArray(disruption.impacted_objects)) {
        return false;
    }
    
    return disruption.impacted_objects.some((obj: Impact) => {
        const ptObject = obj.pt_object;
        if (!ptObject) return false;
        
        // Match using pt_object.trip.id if available, otherwise fallback to pt_object.id
        const disruptionTripId = ptObject.trip?.id || (ptObject.embedded_type === 'trip' ? ptObject.id : null);
        return disruptionTripId && disruptionTripId === sectionTripId;
    });
};

/**
 * Check if a disruption matches a journey section by stop point using impacted_objects.pt_object
 */
export const doesDisruptionMatchSectionByStopPoint = (
    disruption: Disruption,
    stopPointIds: string[]
): boolean => {
    if (!stopPointIds || stopPointIds.length === 0 || !disruption.impacted_objects || !Array.isArray(disruption.impacted_objects)) {
        return false;
    }
    
    return disruption.impacted_objects.some((obj: Impact) => {
        const ptObject = obj.pt_object;
        if (!ptObject || ptObject.embedded_type !== 'stop_point' || !ptObject.id) {
            return false;
        }
        
        return stopPointIds.includes(ptObject.id);
    });
};

