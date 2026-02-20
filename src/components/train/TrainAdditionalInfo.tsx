import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { cleanLocationName } from '@/services/locationService';
import type { ExtendedVehicleJourney } from './types';
import type { DisplayInformation } from '@/client/models/display-information';

interface TrainAdditionalInfoProps {
    trainData: ExtendedVehicleJourney;
    displayInfo: DisplayInformation;
    stopTimes: NonNullable<ExtendedVehicleJourney['stop_times']>;
}

const TrainAdditionalInfo: React.FC<TrainAdditionalInfoProps> = ({
    trainData,
    displayInfo,
    stopTimes,
}) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Informations complémentaires</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <li><strong>ID du train:</strong> <code>{trainData.id}</code></li>
                {displayInfo.physical_mode && (
                    <li><strong>Mode de transport:</strong> {displayInfo.physical_mode}</li>
                )}
                {displayInfo.commercial_mode && (
                    <li><strong>Mode commercial:</strong> {displayInfo.commercial_mode}</li>
                )}
                {displayInfo.network && (
                    <li><strong>Réseau:</strong> {displayInfo.network}</li>
                )}
                {stopTimes.length > 0 && (
                    <>
                        <li><strong>Nombre d'arrêts:</strong> {stopTimes.length}</li>
                        <li><strong>Gare de départ:</strong> {cleanLocationName((stopTimes[0] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.name || (stopTimes[0] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.stop_area?.name || 'N/A')}</li>
                        <li><strong>Gare d'arrivée:</strong> {cleanLocationName((stopTimes[stopTimes.length - 1] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.name || (stopTimes[stopTimes.length - 1] as NonNullable<ExtendedVehicleJourney['stop_times']>[0])?.stop_point?.stop_area?.name || 'N/A')}</li>
                    </>
                )}
            </Box>
        </Paper>
    );
};

export default TrainAdditionalInfo;
