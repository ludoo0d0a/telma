import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '@/components/Footer';
import TrainWaypointsMap from '@/components/TrainWaypointsMap';
import Ad from '@/components/Ad';
import { getVehicleJourney } from '@/services/vehicleJourneyService';
import { decodeVehicleJourneyId } from '@/utils/uriUtils';
import { cleanLocationName } from '@/services/locationService';
import TrainSearch from '@/components/train/TrainSearch';
import TrainLoadingState from '@/components/train/TrainLoadingState';
import TrainErrorState from '@/components/train/TrainErrorState';
import TrainHeader from '@/components/train/TrainHeader';
import TrainInfoCard from '@/components/train/TrainInfoCard';
import TrainStopTimesTable from '@/components/train/TrainStopTimesTable';
import TrainAdditionalInfo from '@/components/train/TrainAdditionalInfo';
import type { ExtendedVehicleJourney, Waypoint } from '@/components/train/types';

const Train: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const [trainData, setTrainData] = useState<ExtendedVehicleJourney | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchTrainDetails = async (isRefresh: boolean = false): Promise<void> => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);
            // Decode the ID
            const decodedId = decodeVehicleJourneyId(id);
            const response = await getVehicleJourney(decodedId, 'sncf');
            const data = response.data;
            
            if (data.vehicle_journeys && data.vehicle_journeys.length > 0) {
                setTrainData(data.vehicle_journeys[0] as ExtendedVehicleJourney);
            } else {
                setError('Train non trouvé');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setError('Erreur lors de la récupération des détails du train: ' + errorMessage);
            console.error(err);
        } finally {
            if (isRefresh) {
                setRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchTrainDetails();
    }, [id]);

    const handleRefresh = (): void => {
        fetchTrainDetails(true);
    };

    // Show search interface when no ID is provided
    if (!id) {
        return (
            <>
                <TrainSearch />
                <Footer />
            </>
        );
    }

    if (loading) {
        return <TrainLoadingState />;
    }

    if (error || !trainData) {
        return (
            <TrainErrorState 
                error={error}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />
        );
    }

    const displayInfo = trainData.display_informations || {};
    const stopTimes = trainData.stop_times || [];
    const commercialMode = displayInfo.commercial_mode || '';
    const network = displayInfo.network || '';
    const trainNumber = displayInfo.headsign || displayInfo.trip_short_name || 'N/A';
    const direction = displayInfo.direction || '';

    const waypoints: Waypoint[] = (stopTimes || [])
        .map((stop, index) => {
            const stopPoint = stop?.stop_point || {};
            const stopArea = (stopPoint as { stop_area?: { name?: string | null; coord?: { lat?: number; lon?: number } } }).stop_area || {};
            const coord = (stopPoint as { coord?: { lat?: number; lon?: number } }).coord || stopArea?.coord;
            const lat = coord?.lat;
            const lon = coord?.lon;

            if (typeof lat !== 'number' || typeof lon !== 'number') return null;
            if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

            return {
                lat,
                lon,
                name: cleanLocationName((stopPoint as { name?: string | null }).name || stopArea?.name || `Arrêt ${index + 1}`),
                isStart: index === 0,
                isEnd: index === stopTimes.length - 1,
            };
        })
        .filter((w): w is Waypoint => w !== null)
        // drop consecutive duplicates (happens with some datasets)
        .filter((w, idx, arr) => idx === 0 || w.lat !== arr[idx - 1].lat || w.lon !== arr[idx - 1].lon);

    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='box'>
                        <TrainHeader 
                            trainNumber={trainNumber}
                            onRefresh={handleRefresh}
                            refreshing={refreshing}
                        />

                        {/* Advertisement */}
                        <Ad format="horizontal" size="responsive" className="mb-5" />

                        {/* Train Header Info */}
                        <TrainInfoCard 
                            trainNumber={trainNumber}
                            commercialMode={commercialMode}
                            network={network}
                            direction={direction}
                        />

                        {/* Map / Waypoints */}
                        {waypoints.length > 0 && (
                            <div className='box'>
                                <h3 className='title is-4 mb-4'>Parcours</h3>
                                <TrainWaypointsMap waypoints={waypoints} />
                                <p className='help mt-3'>
                                    Waypoints basés sur les coordonnées (<code>lat/lon</code>) des arrêts du train.
                                </p>
                            </div>
                        )}

                        {/* Advertisement */}
                        <Ad format="rectangle" size="responsive" className="mb-5" />

                        {/* Stop Times Table */}
                        <TrainStopTimesTable stopTimes={stopTimes} />

                        {/* Additional Information */}
                        <TrainAdditionalInfo 
                            trainData={trainData}
                            displayInfo={displayInfo}
                            stopTimes={stopTimes}
                        />
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Train;
