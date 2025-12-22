import { parseUTCDate } from '@/utils/dateUtils';

/**
 * Calculate delay between base and real departure/arrival times
 */
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

/**
 * Get delay string from base and real times (API date strings)
 */
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

/**
 * Get delay in minutes (numeric value)
 */
export const getDelayMinutes = (baseTime: string | null | undefined, realTime: string | null | undefined): number => {
    if (!baseTime || !realTime) return 0;
    const base = parseUTCDate(baseTime);
    const real = parseUTCDate(realTime);
    const delayMs = real.getTime() - base.getTime();
    return Math.floor(delayMs / (1000 * 60));
}

/**
 * Get the maximum delay between departure and arrival delays
 */
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

