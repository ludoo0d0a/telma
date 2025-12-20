import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlacesNearby, getDepartures, getArrivals, formatDateTime } from '../services/navitiaApi';
import { getVehicleJourney, extractVehicleJourneyId } from '../services/vehicleJourneyService';
import { cleanLocationName } from '../services/locationService';
import { parseUTCDate } from './Utils';

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

const CurrentLocationWidget: React.FC = () => {
    const [locationInfo, setLocationInfo] = useState<CurrentLocationInfo>({
        loading: false,
        error: null
    });
    const navigate = useNavigate();

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371000; // Earth radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Find train at location (simplified version)
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
                getArrivals(stopAreaId, nowStr, 'sncf', { count: 5, depth: 2 })
            ]);

            const allTrains = [
                ...(departuresResponse.data.departures || []),
                ...(arrivalsResponse.data.arrivals || [])
            ];

            // Find the closest train by checking stop times
            for (const train of allTrains.slice(0, 3)) { // Check first 3 trains
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
                    
                    // Check if train is at a stop near user location
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
                            
                            // Train should be at this stop if distance < 100m and time < 5 minutes
                            if (distance < 100 && timeDiff < 5 * 60 * 1000) {
                                const displayInfo = vehicleJourney.display_informations || train.display_informations;
                                return {
                                    number: displayInfo?.headsign || displayInfo?.trip_short_name || 'N/A',
                                    destination: displayInfo?.direction || 'Inconnu'
                                };
                            }
                        }
                    }
                } catch (err) {
                    continue;
                }
            }

            return null;
        } catch (err) {
            console.error('Error finding train:', err);
            return null;
        }
    };

    const detectCurrentLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocationInfo({
                loading: false,
                error: 'Géolocalisation non supportée'
            });
            return;
        }

        setLocationInfo(prev => ({ ...prev, loading: true, error: null }));

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000 // Cache for 1 minute
                    }
                );
            });

            const { latitude, longitude } = position.coords;
            
            // Find nearby stations
            const coordStr = `${longitude};${latitude}`;
            let response;
            try {
                response = await getPlacesNearby(coordStr, 'sncf', {
                    type: ['stop_area', 'stop_point'],
                    count: 5,
                    distance: 500,
                    depth: 2
                });
            } catch (apiError: any) {
                if (apiError?.response?.status === 404) {
                    try {
                        response = await getPlacesNearby(coordStr, 'sncf', {
                            count: 5,
                            distance: 500,
                            depth: 2
                        });
                    } catch (fallbackError) {
                        setLocationInfo({
                            loading: false,
                            error: 'Zone non couverte'
                        });
                        return;
                    }
                } else {
                    setLocationInfo({
                        loading: false,
                        error: 'Erreur de recherche'
                    });
                    return;
                }
            }

            const places = response.data.places || [];
            const stations = places.filter(place => 
                place.embedded_type === 'stop_area' || place.embedded_type === 'stop_point'
            );

            if (stations.length === 0) {
                setLocationInfo({
                    loading: false,
                    error: null
                });
                return;
            }

            // Find closest station
            let closestStation: any = null;
            let minDistance = Infinity;

            for (const station of stations) {
                const coord = station.coord || 
                    station.stop_area?.coord || 
                    station.stop_point?.coord ||
                    station.stop_point?.stop_area?.coord;
                
                if (coord?.lat && coord?.lon) {
                    const distance = calculateDistance(latitude, longitude, coord.lat, coord.lon);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestStation = station;
                    }
                }
            }

            if (!closestStation || minDistance > 200) {
                setLocationInfo({
                    loading: false,
                    error: null
                });
                return;
            }

            const stationId = closestStation.stop_area?.id || closestStation.id;
            const stationName = cleanLocationName(
                closestStation.stop_area?.name || 
                closestStation.stop_point?.name || 
                closestStation.name
            ) || 'Gare inconnue';

            // Try to find train
            const train = await findTrainAtLocation(
                latitude,
                longitude,
                stationId
            );

            setLocationInfo({
                station: {
                    name: stationName,
                    distance: Math.round(minDistance)
                },
                train: train || undefined,
                loading: false,
                error: null
            });
        } catch (err: any) {
            console.error('Error detecting location:', err);
            setLocationInfo({
                loading: false,
                error: err?.message || 'Erreur de détection'
            });
        }
    }, []);

    useEffect(() => {
        detectCurrentLocation();
    }, [detectCurrentLocation]);

    const handleClick = () => {
        navigate('/location-detection');
    };

    if (locationInfo.loading) {
        return (
            <div className='card dashboard-card current-location-widget' onClick={handleClick}>
                <div className='card-content'>
                    <div className='media'>
                        <div className='media-left'>
                            <span className='icon is-large has-text-primary'>
                                <i className='fas fa-spinner fa-spin fa-2x'></i>
                            </span>
                        </div>
                        <div className='media-content'>
                            <p className='title is-5'>Détection en cours...</p>
                            <p className='subtitle is-6 has-text-secondary'>Localisation de votre position</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (locationInfo.error) {
        return (
            <div className='card dashboard-card current-location-widget' onClick={handleClick}>
                <div className='card-content'>
                    <div className='media'>
                        <div className='media-left'>
                            <span className='icon is-large has-text-warning'>
                                <i className='fas fa-exclamation-triangle fa-2x'></i>
                            </span>
                        </div>
                        <div className='media-content'>
                            <p className='title is-5'>Position non détectée</p>
                            <p className='subtitle is-6 has-text-secondary'>Cliquez pour détecter votre position</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!locationInfo.station) {
        return (
            <div className='card dashboard-card current-location-widget' onClick={handleClick}>
                <div className='card-content'>
                    <div className='media'>
                        <div className='media-left'>
                            <span className='icon is-large has-text-grey'>
                                <i className='fas fa-map-marker-alt fa-2x'></i>
                            </span>
                        </div>
                        <div className='media-content'>
                            <p className='title is-5'>Aucune gare détectée</p>
                            <p className='subtitle is-6 has-text-secondary'>Cliquez pour détecter votre position</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='card dashboard-card current-location-widget has-background-info' onClick={handleClick}>
            <div className='card-content'>
                <div className='media'>
                    <div className='media-left'>
                        <span className='icon is-large has-text-white'>
                            {locationInfo.train ? (
                                <i className='fas fa-train fa-2x'></i>
                            ) : (
                                <i className='fas fa-map-marker-alt fa-2x'></i>
                            )}
                        </span>
                    </div>
                    <div className='media-content'>
                        {locationInfo.train ? (
                            <>
                                <p className='title is-5 has-text-white'>
                                    Train {locationInfo.train.number}
                                </p>
                                <p className='subtitle is-6 has-text-white'>
                                    <span className='icon is-small'><i className='fas fa-map-marker-alt'></i></span>
                                    {locationInfo.station.name} • Destination: {locationInfo.train.destination}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className='title is-5 has-text-white'>
                                    {locationInfo.station.name}
                                </p>
                                <p className='subtitle is-6 has-text-white'>
                                    <span className='icon is-small'><i className='fas fa-ruler'></i></span>
                                    À {locationInfo.station.distance}m • Cliquez pour plus d'infos
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentLocationWidget;

