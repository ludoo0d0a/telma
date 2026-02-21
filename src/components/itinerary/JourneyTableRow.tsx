import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Chip, Button, Box, Typography } from '@mui/material';
import { AlertTriangle, Info, Train as TrainIcon, Clock } from 'lucide-react';
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
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': { bgcolor: 'action.hover' },
                borderRadius: 2,
                overflow: 'hidden'
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Header: Destination and Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="info.main"
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                        }}
                    >
                        {journeyInfo.arrivalStation}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                        {formatDate(depDate, 'short')}
                    </Typography>
                </Box>

                {/* Main Info: Time and Delay */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {formatTime(parseUTCDate(journeyInfo.baseDepartureTime))}
                        <Typography component="span" variant="body2" color="text.secondary" fontWeight={400}>→</Typography>
                        {formatTime(parseUTCDate(journeyInfo.baseArrivalTime))}
                    </Typography>

                    {maxDelay && (
                        <Chip
                            label={maxDelay}
                            size="small"
                            color={maxDelay !== 'À l\'heure' ? 'error' : 'success'}
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                    )}
                </Box>

                {/* Secondary Info: Train, Duration, Wagons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: journeyDisruptions.length > 0 ? 1 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                        <TransportIcon size={14} />
                        {journeyInfo.vehicleJourneyId ? (() => {
                            let trainId = journeyInfo.vehicleJourneyId;
                            if (typeof trainId === 'object' && trainId !== null) {
                                trainId = (trainId as { id?: string; href?: string }).id || (trainId as { id?: string; href?: string }).href || null;
                            }
                            return trainId ? (
                                <Link
                                    to={`/train/${encodeVehicleJourneyId(trainId)}`}
                                    style={{ color: 'inherit', fontWeight: 600, textDecoration: 'none', marginLeft: '4px', fontSize: '0.75rem' }}
                                >
                                    {journeyInfo.trainNumber}
                                </Link>
                            ) : (
                                <Typography variant="caption" fontWeight={600} sx={{ ml: 0.5 }}>{journeyInfo.trainNumber}</Typography>
                            );
                        })() : (
                            <Typography variant="caption" fontWeight={600} sx={{ ml: 0.5 }}>{journeyInfo.trainNumber}</Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
                        <Clock size={14} />
                        <Typography variant="caption">{Math.floor(journeyInfo.duration / 60)}min</Typography>
                    </Box>

                    {journeyInfo.wagonCount && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
                            <TrainIcon size={14} />
                            <Typography variant="caption">{journeyInfo.wagonCount}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Disruptions: Only show if they exist */}
                {journeyDisruptions.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {journeyDisruptions.map((disruption, disIndex) => {
                            let severityText = 'unknown';
                            if (typeof disruption.severity === 'string') {
                                severityText = disruption.severity;
                            } else if (disruption.severity && typeof disruption.severity === 'object') {
                                severityText = (disruption.severity as { name?: string; label?: string }).name || (disruption.severity as { name?: string; label?: string }).label || 'Perturbation';
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
                                    icon={<AlertTriangle size={12} />}
                                    label={message.length > 25 ? message.substring(0, 25) + '...' : message}
                                    title={message}
                                    sx={{ height: 18, fontSize: '0.65rem' }}
                                />
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Action: Detail Button */}
            <Button
                component={Link}
                to={`/trip/${tripId}`}
                variant="outlined"
                size="small"
                color="info"
                onClick={onDetailClick}
                sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    p: 0,
                    flexShrink: 0
                }}
                title="Voir les détails du trajet"
            >
                <Info size={20} />
            </Button>
        </Paper>
    );
};

export default JourneyTableRow;
