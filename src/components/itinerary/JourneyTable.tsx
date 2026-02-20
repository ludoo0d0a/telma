import React from 'react';
import { Paper, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import JourneyTableRow from './JourneyTableRow';

interface JourneyTableProps {
    journeys: JourneyItem[];
    getJourneyInfo: (journey: JourneyItem) => JourneyInfo;
    getJourneyDisruptions: (journey: JourneyItem, journeyInfo: JourneyInfo) => Disruption[];
    generateTripId: (journey: JourneyItem, journeyInfo: JourneyInfo) => string;
    onDetailClick: (journey: JourneyItem, journeyInfo: JourneyInfo, journeyDisruptions: Disruption[], tripId: string) => void;
}

const JourneyTable: React.FC<JourneyTableProps> = ({
    journeys,
    getJourneyInfo,
    getJourneyDisruptions,
    generateTripId,
    onDetailClick,
}) => {
    return (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, pb: 0 }}>
                Trains disponibles <Chip label={journeys.length} color="primary" size="small" sx={{ ml: 1 }} />
            </Typography>
            <TableContainer>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Train</TableCell>
                            <TableCell>Départ</TableCell>
                            <TableCell>Arrivée</TableCell>
                            <TableCell>Retard</TableCell>
                            <TableCell>Perturbations</TableCell>
                            <TableCell>Durée</TableCell>
                            <TableCell>Wagons</TableCell>
                            <TableCell>Détails</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {journeys.map((journey, index) => {
                            const journeyInfo = getJourneyInfo(journey);
                            const journeyDisruptions = getJourneyDisruptions(journey, journeyInfo);
                            const tripId = generateTripId(journey, journeyInfo);

                            return (
                                <JourneyTableRow
                                    key={index}
                                    journey={journey}
                                    journeyInfo={journeyInfo}
                                    journeyDisruptions={journeyDisruptions}
                                    tripId={tripId}
                                    onDetailClick={() => onDetailClick(journey, journeyInfo, journeyDisruptions, tripId)}
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default JourneyTable;
