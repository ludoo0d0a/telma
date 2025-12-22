import React from 'react';
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
    stopTimes 
}) => {
    return (
        <div className='box'>
            <h3 className='title is-4 mb-4'>Informations complémentaires</h3>
            <div className='content'>
                <ul>
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
                </ul>
            </div>
        </div>
    );
};

export default TrainAdditionalInfo;

