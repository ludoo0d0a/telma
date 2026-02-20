import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { parseUTCDate, formatTime } from '@/utils/dateUtils';
import { calculateDelay } from '@/services/delayService';
import type { ExtendedVehicleJourney } from './types';

interface TrainStopTimesTableProps {
    stopTimes: NonNullable<ExtendedVehicleJourney['stop_times']>;
}

const TrainStopTimesTable: React.FC<TrainStopTimesTableProps> = ({ stopTimes }) => {
    if (stopTimes.length === 0) {
        return null;
    }

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Arrêts et horaires</Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Gare</strong></TableCell>
                            <TableCell><strong>Horaire prévu</strong></TableCell>
                            <TableCell><strong>Horaire réel</strong></TableCell>
                            <TableCell><strong>Retard</strong></TableCell>
                            <TableCell><strong>Quai/Voie</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stopTimes.map((stop, index) => {
                            const extendedStop = stop as NonNullable<ExtendedVehicleJourney['stop_times']>[0];
                            const baseArrival = extendedStop?.base_arrival_date_time;
                            const realArrival = extendedStop?.arrival_date_time;
                            const baseDeparture = extendedStop?.base_departure_date_time;
                            const realDeparture = extendedStop?.departure_date_time;

                            const baseTime = index === stopTimes.length - 1 ? baseDeparture : baseArrival;
                            const realTime = index === stopTimes.length - 1 ? realDeparture : realArrival;

                            let delay: string | null = null;
                            if (baseTime && realTime) {
                                try {
                                    delay = calculateDelay(
                                        parseUTCDate(baseTime),
                                        parseUTCDate(realTime)
                                    );
                                } catch {
                                    delay = null;
                                }
                            }

                            const stopPoint = extendedStop?.stop_point || {};
                            const stopArea = (stopPoint as { stop_area?: { name?: string | null } }).stop_area || {};
                            const stopName = (stopPoint as { name?: string | null }).name || stopArea?.name || 'Gare inconnue';
                            const platform = (stopPoint as { label?: string | null }).label || 'N/A';

                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <strong>{stopName}</strong>
                                        {index === 0 && <Chip label="Départ" color="success" size="small" sx={{ ml: 1 }} />}
                                        {index === stopTimes.length - 1 && <Chip label="Arrivée" color="error" size="small" sx={{ ml: 1 }} />}
                                    </TableCell>
                                    <TableCell>{baseTime ? formatTime(parseUTCDate(baseTime)) : 'N/A'}</TableCell>
                                    <TableCell>
                                        {realTime && realTime !== baseTime ? (
                                            <span style={{ color: 'var(--primary)' }}>{formatTime(parseUTCDate(realTime))}</span>
                                        ) : baseTime ? (
                                            formatTime(parseUTCDate(baseTime))
                                        ) : (
                                            'N/A'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {delay ? (
                                            delay !== "À l'heure" && delay !== "à l'heure" ? (
                                                <Chip label={delay} color="error" size="small" />
                                            ) : (
                                                <Chip label="À l'heure" color="success" size="small" />
                                            )
                                        ) : (
                                            <Chip label="N/A" variant="outlined" size="small" />
                                        )}
                                    </TableCell>
                                    <TableCell>{platform}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default TrainStopTimesTable;
