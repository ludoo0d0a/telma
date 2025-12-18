import type { Section } from '../client/models/section';

export interface TransportIconInfo {
    icon: string;
    color: string;
    tagColor: string;
    label: string;
}

/**
 * Get transport icon, color, and label based on commercial mode and network
 */
export const getTransportIcon = (commercialMode: string | null | undefined, network: string | null | undefined): TransportIconInfo => {
    const mode = (commercialMode || '').toLowerCase();
    const net = (network || '').toLowerCase();
    
    if (mode.includes('tgv') || net.includes('tgv')) {
        return { icon: 'fa-train', color: 'has-text-danger', tagColor: 'is-danger', label: 'TGV' };
    }
    if (mode.includes('intercités') || net.includes('intercités') || mode.includes('intercity')) {
        return { icon: 'fa-train', color: 'has-text-warning', tagColor: 'is-warning', label: 'Intercités' };
    }
    if (mode === 'ter' || net.includes('ter')) {
        return { icon: 'fa-train', color: 'has-text-info', tagColor: 'is-info', label: 'TER' };
    }
    if (mode === 'fluo' || net.includes('fluo')) {
        return { icon: 'fa-train', color: 'has-text-success', tagColor: 'is-success', label: 'FLUO' };
    }
    if (mode.includes('rer') || net.includes('rer')) {
        return { icon: 'fa-subway', color: 'has-text-primary', tagColor: 'is-primary', label: 'RER' };
    }
    if (mode.includes('metro') || net.includes('metro')) {
        return { icon: 'fa-subway', color: 'has-text-primary', tagColor: 'is-primary', label: 'Métro' };
    }
    if (mode.includes('tram') || net.includes('tram')) {
        return { icon: 'fa-tram', color: 'has-text-link', tagColor: 'is-link', label: 'Tram' };
    }
    if (mode.includes('bus') || net.includes('bus')) {
        return { icon: 'fa-bus', color: 'has-text-success', tagColor: 'is-success', label: 'Bus' };
    }
    return { icon: 'fa-train', color: 'has-text-grey', tagColor: 'is-dark', label: commercialMode || 'Train' };
};

/**
 * Get wagon count from a section
 */
export const getWagonCount = (section: Section | null | undefined): number | string | null => {
    // Try to find wagon/car count from various possible fields
    // Check vehicle_journey, vehicle, or other fields that might contain this info
    if (!section) return null;
    
    // Check for vehicle_journey with vehicle information
    const vehicleJourney = section.vehicle_journey;
    if (vehicleJourney) {
        // Check if vehicle_journey has direct vehicle info
        if (vehicleJourney.vehicle) {
            const vehicle = vehicleJourney.vehicle;
            // Check for wagon count, car count, or capacity
            if (vehicle.wagon_count !== undefined) return vehicle.wagon_count;
            if (vehicle.car_count !== undefined) return vehicle.car_count;
            if (vehicle.length !== undefined) return vehicle.length;
            if (vehicle.capacity !== undefined) {
                // Capacity might be seats, not wagons, but we can try
                return vehicle.capacity;
            }
        }
        // Check for headsigns or other indicators
        if (vehicleJourney.headsigns) {
            // Sometimes headsigns contain train composition info
            const headsign = vehicleJourney.headsigns[0];
            if (headsign) {
                const match = headsign.match(/(\d+)\s*(wagon|car|voiture)/i);
                if (match) return parseInt(match[1]);
            }
        }
    }
    
    // Check for trip information
    const trip = section.trip;
    if (trip) {
        if (trip.vehicle_journey) {
            const vj = trip.vehicle_journey;
            if (vj.vehicle) {
                const vehicle = vj.vehicle;
                if (vehicle.wagon_count !== undefined) return vehicle.wagon_count;
                if (vehicle.car_count !== undefined) return vehicle.car_count;
                if (vehicle.length !== undefined) return vehicle.length;
            }
        }
    }
    
    // Check display_informations for any hints
    const displayInfo = section.display_informations;
    if (displayInfo) {
        // Check physical_mode name which might indicate train type/length
        const physicalMode = displayInfo.physical_mode;
        if (physicalMode && typeof physicalMode === 'string') {
            // Some physical modes indicate train length (e.g., "Train long", "Train court")
            const modeLower = physicalMode.toLowerCase();
            if (modeLower.includes('long')) return 'Long';
            if (modeLower.includes('court') || modeLower.includes('short')) return 'Court';
        }
        // Check additional_informations
        const additionalInfo = displayInfo.additional_informations;
        if (additionalInfo) {
            const match = additionalInfo.match(/(\d+)\s*(wagon|car|voiture)/i);
            if (match) return parseInt(match[1]);
        }
    }
    
    return null;
};

