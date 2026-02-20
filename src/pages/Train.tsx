import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';
import Footer from '@/components/Footer';
import TrainWaypointsMap from '@/components/TrainWaypointsMap';
import Ad from '@/components/Ad';
import { getVehicleJourney } from '@/services/vehicleJourneyService';
import { decodeVehicleJourneyId, extractTrainNumber } from '@/utils/uriUtils';
import { cleanLocationName } from '@/services/locationService';
import TrainSearch from '@/components/train/TrainSearch';
import TrainLoadingState from '@/components/train/TrainLoadingState';
import TrainErrorState from '@/components/train/TrainErrorState';
import TrainHeader from '@/components/train/TrainHeader';
import TrainInfoCard from '@/components/train/TrainInfoCard';
import TrainStopTimesTable from '@/components/train/TrainStopTimesTable';
import TrainAdditionalInfo from '@/components/train/TrainAdditionalInfo';
import PageLayout from '@/components/shared/PageLayout';
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
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
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
            if (isRefresh) setRefreshing(false);
            else setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainDetails();
    }, [id]);

    const handleRefresh = (): void => fetchTrainDetails(true);

    if (!id) {
        return (
            <>
                <TrainSearch />
                <Footer />
            </>
        );
    }

    if (loading) {
        return (
            <>
                <TrainLoadingState />
            </>
        );
    }

    if (error || !trainData) {
        return (
            <>
                <TrainErrorState error={error} onRefresh={handleRefresh} refreshing={refreshing} />
            </>
        );
    }

    const displayInfo = trainData.display_informations || {};
    const stopTimes = trainData.stop_times || [];
    const commercialMode = displayInfo.commercial_mode || '';
    const network = displayInfo.network || '';
    const trainNumber = extractTrainNumber(trainData, id);
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
        .filter((w, idx, arr) => idx === 0 || w.lat !== arr[idx - 1].lat || w.lon !== arr[idx - 1].lon);

    return (
        <>
            <PageLayout>
                <Paper sx={{ p: 2 }}>
                    <TrainHeader trainNumber={trainNumber} onRefresh={handleRefresh} refreshing={refreshing} />

                    <Box sx={{ mb: 2 }}>
                        <Ad format="horizontal" size="responsive" />
                    </Box>

                    <TrainInfoCard
                        trainNumber={trainNumber}
                        commercialMode={commercialMode}
                        network={network}
                        direction={direction}
                    />

                    {waypoints.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Parcours</Typography>
                            <TrainWaypointsMap waypoints={waypoints} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Waypoints basés sur les coordonnées (lat/lon) des arrêts du train.
                            </Typography>
                        </Paper>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <Ad format="rectangle" size="responsive" />
                    </Box>

                    <TrainStopTimesTable stopTimes={stopTimes} />

                    <TrainAdditionalInfo trainData={trainData} displayInfo={displayInfo} stopTimes={stopTimes} />
                </Paper>
            </PageLayout>
            <Footer />
        </>
    );
};

export default Train;
