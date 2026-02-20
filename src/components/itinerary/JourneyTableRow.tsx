import React from 'react';
import { Link } from 'react-router-dom';
import { TableCell, TableRow, Chip, Button, Box, Typography } from '@mui/material';
import { AlertTriangle, Info, Train as TrainIcon } from 'lucide-react';
import type { JourneyItem } from '@/client/models/journey-item';
import type { JourneyInfo } from '@/services/journeyService';
import type { Disruption } from '@/client/models/disruption';
import { parseUTCDate, formatTime, formatDate } from '@/utils/dateUtils';
import { getDelay, getMaxDelay } from '@/services/delayService';
import { encodeVehicleJourneyId } from '@/utils/uriUtils';

const tagClassToChipColor = (tagClass: string): 'error' | 'success' | 'warning' | 'info' | 'default' | 'primary' => {
    if (tagClass === 'is-danger') return 'error';
    if (tagClass === 'is-success') return 'success';
    if (tagClass === 'is-warning') return 'warning';
    if (tagClass === 'is-info') return 'info';
    if (tagClass === 'is-primary') return 'primary';
    return 'default';
};

interface JourneyTableRowProps {
    journey: JourneyItem;
    journeyInfo: JourneyInfo;
    journeyDisruptions: Disruption[];
    tripId: string;
    onDetailClick: () => void;
}

const JourneyTableRow: React.FC<JourneyTableRowProps> = ({
    journey,
    journeyInfo,
    journeyDisruptions,
    tripId,
    onDetailClick,
}) => {
    const depDate = parseUTCDate(journeyInfo.departureTime);
    const arrDate = parseUTCDate(journeyInfo.arrivalTime);
    const depDelay = getDelay(journeyInfo.baseDepartureTime, journeyInfo.realDepartureTime);
    const arrDelay = getDelay(journeyInfo.baseArrivalTime, journeyInfo.realArrivalTime);
    const maxDelay = getMaxDelay(
        depDelay,
        arrDelay,
        journeyInfo.baseDepartureTime,
        journeyInfo.realDepartureTime,
        journeyInfo.baseArrivalTime,
        journeyInfo.realArrivalTime
    );

    const TransportIcon = journeyInfo.transportIcon;

    return (
        <TableRow hover>
            <TableCell>
                <Chip label={formatDate(depDate, 'short')} size="small" color="default" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box component="span" sx={{ mr: 1, color: 'primary.main', display: 'inline-flex' }}>
                            <TransportIcon size={20} />
                        </Box>
                        {journeyInfo.vehicleJourneyId ? (() => {
                            let trainId = journeyInfo.vehicleJourneyId;
                            if (typeof trainId === 'object' && trainId !== null) {
                                trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
                            }
                            return trainId ? (
                                <Link
                                    to={`/train/${encodeVehicleJourneyId(trainId)}`}
                                    style={{ color: 'inherit', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    {journeyInfo.trainNumber}
                                </Link>
                            ) : (
                                <Typography component="span" fontWeight={600} color="primary.main">{journeyInfo.trainNumber}</Typography>
                            );
                        })() : (
                            <Typography component="span" fontWeight={600} color="primary.main">{journeyInfo.trainNumber}</Typography>
                        )}
                    </Box>
                    <Chip label={journeyInfo.transportLabel} size="small" sx={{ mr: 0.5 }} />
                    {journeyInfo.network && journeyInfo.network !== journeyInfo.commercialMode && (
                        <>
                            <br />
                            <Typography component="small" variant="caption" color="text.secondary">{journeyInfo.network}</Typography>
                        </>
                    )}
                </Box>
            </TableCell>
            <TableCell>
                <Box>
                    <Typography fontWeight={600} color="info.main">{journeyInfo.departureStation}</Typography>
                    <br />
                    <Typography component="span">{formatTime(parseUTCDate(journeyInfo.baseDepartureTime))}</Typography>
                    {depDelay && depDelay !== 'À l\'heure' && (
                        <>
                            <br />
                            <Typography component="span" color="error.main">{formatTime(parseUTCDate(journeyInfo.realDepartureTime))}</Typography>
                        </>
                    )}
                    {depDelay && (
                        <>
                            <br />
                            <Chip
                                label={depDelay}
                                size="small"
                                color={depDelay !== 'À l\'heure' ? 'error' : 'success'}
                            />
                        </>
                    )}
                </Box>
            </TableCell>
            <TableCell>
                <Box>
                    <Typography fontWeight={600} color="info.main">{journeyInfo.arrivalStation}</Typography>
                    <br />
                    <Typography component="span">{formatTime(parseUTCDate(journeyInfo.baseArrivalTime))}</Typography>
                    {arrDelay && arrDelay !== 'À l\'heure' && (
                        <>
                            <br />
                            <Typography component="span" color="error.main">{formatTime(parseUTCDate(journeyInfo.realArrivalTime))}</Typography>
                        </>
                    )}
                    {arrDelay && (
                        <>
                            <br />
                            <Chip
                                label={arrDelay}
                                size="small"
                                color={arrDelay !== 'À l\'heure' ? 'error' : 'success'}
                            />
                        </>
                    )}
                </Box>
            </TableCell>
            <TableCell>
                {maxDelay && maxDelay !== 'À l\'heure' ? (
                    <Chip label={maxDelay} size="small" color="error" />
                ) : (
                    <Chip label="À l'heure" size="small" color="success" />
                )}
            </TableCell>
            <TableCell>
                {journeyDisruptions.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {journeyDisruptions.map((disruption, disIndex) => {
                            let severityText = 'unknown';
                            if (typeof disruption.severity === 'string') {
                                severityText = disruption.severity;
                            } else if (disruption.severity && typeof disruption.severity === 'object') {
                                severityText = (disruption.severity as { name?: string; label?: string }).name ||
                                              (disruption.severity as { name?: string; label?: string }).label ||
                                              'Perturbation';
                            }
                            const severityLevel = severityText.toLowerCase();
                            let tagClass = 'is-warning';
                            if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                                tagClass = 'is-danger';
                            } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
                                tagClass = 'is-info';
                            } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                                tagClass = 'is-warning';
                            }
                            const message = disruption.messages && disruption.messages.length > 0
                                ? disruption.messages[0].text || (disruption.messages[0] as { message?: string }).message
                                : disruption.message || severityText;
                            return (
                                <Chip
                                    key={disIndex}
                                    size="small"
                                    color={tagClassToChipColor(tagClass)}
                                    icon={<AlertTriangle size={14} />}
                                    label={message.length > 30 ? message.substring(0, 30) + '...' : message}
                                    title={message}
                                />
                            );
                        })}
                    </Box>
                ) : (
                    <Typography component="span" color="text.secondary" fontStyle="italic">-</Typography>
                )}
            </TableCell>
            <TableCell>
                <Chip label={`${Math.floor(journeyInfo.duration / 60)}min`} size="small" sx={{ fontWeight: 600 }} />
            </TableCell>
            <TableCell>
                {journeyInfo.wagonCount ? (
                    <Chip
                        size="small"
                        icon={<TrainIcon size={14} />}
                        label={journeyInfo.wagonCount}
                        color="info"
                    />
                ) : (
                    <Typography component="span" color="text.secondary" fontStyle="italic">N/A</Typography>
                )}
            </TableCell>
            <TableCell>
                <Button
                    component={Link}
                    to={`/trip/${tripId}`}
                    variant="outlined"
                    size="small"
                    color="info"
                    onClick={onDetailClick}
                    title="Voir les détails du trajet"
                >
                    <Info size={16} />
                </Button>
            </TableCell>
        </TableRow>
    );
};

export default JourneyTableRow;
