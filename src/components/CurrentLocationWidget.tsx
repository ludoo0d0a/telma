import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { getPlacesNearby, getDepartures, getArrivals, formatDateTime } from '@/services/navitiaApi';
import { getVehicleJourney, extractVehicleJourneyId } from '@/services/vehicleJourneyService';
import { cleanLocationName } from '@/services/locationService';
import { parseUTCDate } from '@/utils/dateUtils';
import { Loader2, AlertTriangle, MapPin, Train, Ruler } from 'lucide-react';
import { DEFAULT_RADIUS_NEARBY, DEFAULT_RADIUS_NEARBY_LARGE } from '@/pages/LocationDetection';
import { StopAreasResponse } from '@/client';

interface CurrentLocationInfo {
    station?: {
        name: string;
        distance: number;
    };
    train?: {
        number: string;
        destination: string;
    };
    loading: boolean;
    error: string | null;
}

const LocationCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onClick: () => void;
    bgcolor?: string;
    iconColor?: string;
}> = ({ icon, title, subtitle, onClick, bgcolor = 'background.paper', iconColor = 'primary.main' }) => (
    <Card
        onClick={onClick}
        sx={{
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
            bgcolor,
        }}
    >
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ color: iconColor, flexShrink: 0 }}>{icon}</Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const CurrentLocationWidget: React.FC = () => {
    const [locationInfo, setLocationInfo] = useState<CurrentLocationInfo>({
        loading: false,
        error: null,
    });
    const navigate = useNavigate();
    const hasDetectedRef = useRef<boolean>(false);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const findTrainAtLocation = async (
        userLat: number,
        userLon: number,
        stopAreaId: string
    ): Promise<{ number: string; destination: string } | null> => {
        try {
            const now = new Date();
            const nowStr = formatDateTime(now);

            const [departuresResponse, arrivalsResponse] = await Promise.all([
                getDepartures(stopAreaId, nowStr, 'sncf', { count: 5, depth: 2 }),
                getArrivals(stopAreaId, nowStr, 'sncf', { count: 5, depth: 2 }),
            ]);

            const allTrains = [
                ...(departuresResponse.departures || []),
                ...(arrivalsResponse.arrivals || []),
            ];

            for (const train of allTrains.slice(0, 3)) {
                const vehicleJourneyLink = train.links?.find(link =>
                    link.type === 'vehicle_journey' || link.id?.includes('vehicle_journey')
                );
                const rawVehicleJourneyId = vehicleJourneyLink?.id || vehicleJourneyLink?.href;
                const vehicleJourneyId = extractVehicleJourneyId(rawVehicleJourneyId);

                if (!vehicleJourneyId) continue;

                try {
                    const vjResponse = await getVehicleJourney(vehicleJourneyId, 'sncf', 2);
                    const vehicleJourney = vjResponse.data.vehicle_journeys?.[0];

                    if (!vehicleJourney?.stop_times) continue;

                    const stopTimes = vehicleJourney.stop_times as Array<any>;

                    for (const stopTime of stopTimes) {
                        const stopPoint = stopTime.stop_point;
                        const coord = stopPoint?.coord || stopPoint?.stop_area?.coord;

                        if (!coord?.lat || !coord?.lon) continue;

                        const distance = calculateDistance(userLat, userLon, coord.lat, coord.lon);
                        const arrivalTime = stopTime.arrival_date_time || stopTime.base_arrival_date_time || stopTime.utc_arrival_time;
                        const departureTime = stopTime.departure_date_time || stopTime.base_departure_date_time || stopTime.utc_departure_time;

                        if (arrivalTime || departureTime) {
                            const timeStr = departureTime || arrivalTime;
                            const stopDateTime = parseUTCDate(timeStr);
                            const timeDiff = Math.abs(now.getTime() - stopDateTime.getTime());

                            if (distance < 100 && timeDiff < 5 * 60 * 1000) {
                                const displayInfo = train.display_informations || {
                                    headsign: vehicleJourney.headsign || '',
                                    trip_short_name: vehicleJourney.name || '',
                                    network: (vehicleJourney.journey_pattern as any)?.route?.line?.network?.name || 'SNCF',
                                    direction: vehicleJourney.headsign || '',
                                };
                                return {
                                    number: displayInfo?.headsign || displayInfo?.trip_short_name || 'N/A',
                                    destination: displayInfo?.direction || 'Inconnu',
                                };
                            }
                        }
                    }
                } catch {
                    continue;
                }
            }

            return null;
        } catch {
            return null;
        }
    };

    const detectCurrentLocation = useCallback(async () => {
        if (hasDetectedRef.current) return;
        hasDetectedRef.current = true;

        if (!navigator.geolocation) {
            setLocationInfo({ loading: false, error: 'Géolocalisation non supportée' });
            return;
        }

        setLocationInfo(prev => ({ ...prev, loading: true, error: null }));

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000,
                });
            });

            const { latitude, longitude } = position.coords;
            const coordStr = `${longitude};${latitude}`;
            let response: StopAreasResponse;

            try {
                response = await getPlacesNearby(coordStr, 'sncf', {
                    type: ['stop_area', 'stop_point'],
                    count: 5,
                    distance: DEFAULT_RADIUS_NEARBY,
                    depth: 2,
                });
            } catch (apiError: any) {
                if (apiError?.response?.status === 404) {
                    try {
                        response = await getPlacesNearby(coordStr, 'sncf', {
                            type: ['stop_area', 'stop_point'],
                            count: 5,
                            distance: DEFAULT_RADIUS_NEARBY_LARGE,
                            depth: 2,
                        });
                    } catch {
                        setLocationInfo({ loading: false, error: 'Zone non couverte' });
                        return;
                    }
                } else {
                    setLocationInfo({ loading: false, error: 'Erreur de recherche' });
                    return;
                }
            }

            const stations = response.stop_areas || [];
            if (stations.length === 0) {
                setLocationInfo({ loading: false, error: null });
                return;
            }

            let closestStation: any = null;
            let minDistance = Infinity;

            for (const station of stations) {
                const coord = station.coord;
                if (coord?.lat && coord?.lon) {
                    const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestStation = station;
                    }
                }
            }

            if (!closestStation) {
                setLocationInfo({ loading: false, error: null, station: undefined, train: undefined });
                return;
            }

            if (minDistance > 200) {
                setLocationInfo({
                    station: {
                        name: cleanLocationName(
                            closestStation.stop_area?.name ||
                            closestStation.stop_point?.name ||
                            closestStation.name
                        ) || 'Gare inconnue',
                        distance: Math.round(minDistance),
                    },
                    train: undefined,
                    loading: false,
                    error: null,
                });
                return;
            }

            const stationId = closestStation.stop_area?.id || closestStation.id;
            const stationName = cleanLocationName(
                closestStation.stop_area?.name ||
                closestStation.stop_point?.name ||
                closestStation.name
            ) || 'Gare inconnue';

            const train = await findTrainAtLocation(latitude, longitude, stationId);

            setLocationInfo({
                station: {
                    name: stationName,
                    distance: Math.round(minDistance),
                },
                train: train || undefined,
                loading: false,
                error: null,
            });
        } catch (err: any) {
            setLocationInfo({
                loading: false,
                error: err?.message || 'Erreur de détection',
            });
        }
    }, []);

    useEffect(() => {
        detectCurrentLocation();
    }, []);

    const handleClick = () => navigate('/location-detection');

    if (locationInfo.loading) {
        return (
            <LocationCard
                icon={<Loader2 size={32} className="animate-spin" />}
                title="Détection en cours..."
                subtitle="Localisation de votre position"
                onClick={handleClick}
                iconColor="primary.main"
            />
        );
    }

    if (locationInfo.error) {
        return (
            <LocationCard
                icon={<AlertTriangle size={32} />}
                title="Position non détectée"
                subtitle="Cliquez pour détecter votre position"
                onClick={handleClick}
                iconColor="warning.main"
            />
        );
    }

    if (!locationInfo.station) {
        return (
            <LocationCard
                icon={<MapPin size={32} />}
                title="Aucune gare détectée"
                subtitle="Cliquez pour détecter votre position"
                onClick={handleClick}
                iconColor="text.secondary"
            />
        );
    }

    return (
        <Card
            onClick={handleClick}
            sx={{
                cursor: 'pointer',
                bgcolor: 'info.main',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flexShrink: 0 }}>
                        {locationInfo.train ? <Train size={32} /> : <MapPin size={32} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {locationInfo.train ? (
                            <>
                                <Typography variant="h6">
                                    Train {locationInfo.train.number}
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <MapPin size={16} />
                                    {locationInfo.station.name} • Destination: {locationInfo.train.destination}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6">{locationInfo.station.name}</Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                    <Ruler size={16} />
                                    À {locationInfo.station.distance}m • Cliquez pour plus d'infos
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CurrentLocationWidget;
