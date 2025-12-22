import type { VehicleJourney } from '@/client/models/vehicle-journey';
import type { DisplayInformation } from '@/client/models/display-information';
import type { StopTime } from '@/client/models/stop-time';

export interface ExtendedVehicleJourney extends VehicleJourney {
    display_informations?: DisplayInformation;
    stop_times?: Array<StopTime & {
        base_arrival_date_time?: string;
        arrival_date_time?: string;
        base_departure_date_time?: string;
        departure_date_time?: string;
        stop_point?: {
            name?: string | null;
            label?: string | null;
            coord?: { lat?: number; lon?: number };
            stop_area?: {
                name?: string | null;
                coord?: { lat?: number; lon?: number };
            };
        };
    }>;
}

export interface Waypoint {
    lat: number;
    lon: number;
    name: string | null | undefined;
    isStart: boolean;
    isEnd: boolean;
}

