export const parseUTCDate = (apiDate: string): Date => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Utils.ts:1',message:'parseUTCDate called',data:{apiDate:apiDate,type:typeof apiDate,isUndefined:apiDate===undefined,isNull:apiDate===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Handle null/undefined values
    if (!apiDate || typeof apiDate !== 'string') {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Utils.ts:6',message:'parseUTCDate invalid input',data:{apiDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        throw new Error(`parseUTCDate: Invalid date input: ${apiDate}`);
    }
    
    // API date format: "20250113T152944" (UTC)
    // Convert to ISO format and parse as UTC
    const utcDate = apiDate.split('')
    utcDate.splice(4, 0, '-')
    utcDate.splice(7, 0, '-')
    utcDate.splice(13, 0, ':')
    utcDate.splice(16, 0, ':')
    // Append 'Z' to indicate UTC timezone
    const isoString = utcDate.join('') + 'Z'
    return new Date(isoString)
}

export const getFullMinutes = (date: Date): string => {
    if (date.getMinutes() < 10){
        return `0${date.getMinutes()}`
    } else{
        return String(date.getMinutes())
    }
}

export const calculateDelay = (baseDepartureTime: Date, realDepartureTime: Date): string => {
    if (baseDepartureTime.getTime() !== realDepartureTime.getTime()){
        const minutesDelay = (realDepartureTime.getTime() - baseDepartureTime.getTime()) / (1000 * 60)
        if (minutesDelay >= 60) {
            return `retard ${Math.floor(minutesDelay / 60)}h${minutesDelay % 60}`
        }
        return `retard ${minutesDelay}min`
    }
    return 'à l\'heure'
}

// Clean location names by removing redundant parenthetical information
// Example: "Thionville (Thionville)" -> "Thionville"
// But keep: "Paris (Gare du Nord)" -> "Paris (Gare du Nord)"
export const cleanLocationName = (name: string | null | undefined): string | null | undefined => {
    if (!name) return name;
    
    // Match pattern like "Name (Name)" or "Name (name)" or "Name (NAME)"
    const redundantPattern = /^(.+?)\s*\((.+?)\)\s*$/;
    const match = name.match(redundantPattern);
    
    if (match) {
        const mainName = match[1].trim();
        const parentheticalName = match[2].trim();
        
        // Normalize both names for comparison (case-insensitive, trim whitespace)
        const normalizedMain = mainName.toLowerCase().trim();
        const normalizedParenthetical = parentheticalName.toLowerCase().trim();
        
        // If they're the same, return just the main name
        if (normalizedMain === normalizedParenthetical) {
            return mainName;
        }
    }
    
    // Return original name if no redundant pattern found
    return name;
}

interface TransportIconInfo {
    icon: string;
    color: string;
    tagColor: string;
    label: string;
}

// Get transport icon, color, and label based on commercial mode and network
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
    return { icon: 'fa-train', color: 'has-text-grey', tagColor: 'is-light', label: commercialMode || 'Train' };
}

// Format time from Date object
// separator: 'h' (default) or ':' for different formats
export const formatTime = (date: Date | null | undefined, separator: string = 'h'): string => {
    if (!date) return 'N/A';
    if (separator === ':') {
        return `${date.getHours()}:${getFullMinutes(date)}`;
    }
    return `${date.getHours()}h${getFullMinutes(date)}`;
}

// Format date from Date object
// format: 'full' (default) for full format, 'short' for abbreviated format
export const formatDate = (date: Date | null | undefined, format: 'full' | 'short' = 'full'): string => {
    if (!date) return 'N/A';
    
    if (format === 'short') {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    }
    
    // Full format (default)
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Get delay string from base and real times (API date strings)
export const getDelay = (baseTime: string | null | undefined, realTime: string | null | undefined): string | null => {
    if (!baseTime || !realTime) return null;
    const base = parseUTCDate(baseTime);
    const real = parseUTCDate(realTime);
    const delayMs = real.getTime() - base.getTime();
    if (delayMs === 0) return 'À l\'heure';
    const delayMinutes = Math.floor(delayMs / (1000 * 60));
    if (delayMinutes >= 60) {
        return `+${Math.floor(delayMinutes / 60)}h${delayMinutes % 60}min`;
    }
    return `+${delayMinutes}min`;
}

// Get delay in minutes (numeric value)
export const getDelayMinutes = (baseTime: string | null | undefined, realTime: string | null | undefined): number => {
    if (!baseTime || !realTime) return 0;
    const base = parseUTCDate(baseTime);
    const real = parseUTCDate(realTime);
    const delayMs = real.getTime() - base.getTime();
    return Math.floor(delayMs / (1000 * 60));
}

// Get the maximum delay between departure and arrival delays
export const getMaxDelay = (
    depDelay: string | null,
    arrDelay: string | null,
    baseDepTime: string | null | undefined,
    realDepTime: string | null | undefined,
    baseArrTime: string | null | undefined,
    realArrTime: string | null | undefined
): string | null => {
    const depDelayMinutes = getDelayMinutes(baseDepTime, realDepTime);
    const arrDelayMinutes = getDelayMinutes(baseArrTime, realArrTime);
    
    // Return the maximum delay (departure or arrival)
    if (arrDelayMinutes > depDelayMinutes) {
        return arrDelay;
    }
    return depDelay;
}

// Get wagon count from a section
export const getWagonCount = (section: any): number | string | null => {
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
}

interface JourneyInfo {
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

// Get journey information from a journey object
export const getJourneyInfo = (journey: any, fromName: string | null = null, toName: string | null = null): JourneyInfo => {
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Utils.ts:247',message:'Extracting vehicle journey ID',data:{hasVehicleJourney:!!firstSection.vehicle_journey,vehicleJourneyType:typeof firstSection.vehicle_journey,vehicleJourneyId:firstSection.vehicle_journey?.id,hasLinks:!!firstSection.links,linksCount:firstSection.links?.length,hasTrip:!!firstSection.trip,hasTripVehicleJourney:!!firstSection.trip?.vehicle_journey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
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
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/9d3d7068-4952-4f99-89ae-6519e28eef00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Utils.ts:280',message:'Vehicle journey ID extracted',data:{vehicleJourneyId,vehicleJourneyIdType:typeof vehicleJourneyId,isString:typeof vehicleJourneyId === 'string',isObject:typeof vehicleJourneyId === 'object'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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

