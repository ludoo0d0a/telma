import React, { useState } from 'react';
import { Paper, Typography, Box, Alert, Collapse } from '@mui/material';
import { AlertTriangle, ChevronUp, ChevronDown, Ban, Info, Clock } from 'lucide-react';
import type { Disruption } from '@/client/models/disruption';
import { cleanLocationName } from '@/services/locationService';
import type { ImpactApplicationPeriodsInner } from '@/client/models/impact-application-periods-inner';

const severityToAlertSeverity = (notificationClass: string): 'error' | 'warning' | 'info' => {
    if (notificationClass === 'is-danger') return 'error';
    if (notificationClass === 'is-info') return 'info';
    return 'warning';
};

interface DisruptionsListProps {
    disruptions: Disruption[];
}

const DisruptionsList: React.FC<DisruptionsListProps> = ({ disruptions }) => {
    const [showDisruptionsSection, setShowDisruptionsSection] = useState<boolean>(false);

    if (disruptions.length === 0) {
        return null;
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography
                variant="h6"
                onClick={() => setShowDisruptionsSection(!showDisruptionsSection)}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }}
            >
                <AlertTriangle size={20} color="var(--primary, #f97316)" />
                Perturbations ({disruptions.length})
                {showDisruptionsSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </Typography>
            <Collapse in={showDisruptionsSection}>
                {disruptions.map((disruption, index) => {
                    let severityText = 'unknown';
                    if (typeof disruption.severity === 'string') {
                        severityText = disruption.severity;
                    } else if (disruption.severity && typeof disruption.severity === 'object') {
                        severityText = (disruption.severity as { name?: string; label?: string }).name ||
                                      (disruption.severity as { name?: string; label?: string }).label ||
                                      JSON.stringify(disruption.severity);
                    }
                    const severityLevel = severityText.toLowerCase();
                    let notificationClass = 'is-warning';
                    let IconComponent = AlertTriangle;
                    if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                        notificationClass = 'is-danger';
                        IconComponent = Ban;
                    } else if (severityLevel.includes('information') || severityLevel.includes('info')) {
                        notificationClass = 'is-info';
                        IconComponent = Info;
                    } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                        notificationClass = 'is-warning';
                        IconComponent = Clock;
                    }
                    return (
                        <Alert
                            key={index}
                            severity={severityToAlertSeverity(notificationClass)}
                            icon={<IconComponent size={20} />}
                            sx={{ mb: 2 }}
                        >
                            <Typography fontWeight={600} sx={{ mb: 1 }}>
                                {severityText !== 'unknown' ? severityText : 'Perturbation'}
                            </Typography>
                            {disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                    {disruption.messages.map((msg, msgIndex) => (
                                        <Typography key={msgIndex} sx={{ mb: 1 }}>
                                            {msg.text || (msg as { message?: string }).message || JSON.stringify(msg)}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                            {(!disruption.messages || disruption.messages.length === 0) && disruption.message && (
                                <Typography sx={{ mb: 1 }}>{disruption.message}</Typography>
                            )}
                            {disruption.impacted_objects && disruption.impacted_objects.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography fontWeight={600}>Objets impactés:</Typography>
                                    {disruption.impacted_objects.map((obj, objIndex) => (
                                        <Box key={objIndex} sx={{ mb: 2 }}>
                                            <Typography fontWeight={500} sx={{ mb: 1 }}>
                                                {obj.pt_object?.name || obj.pt_object?.id || `Objet ${objIndex + 1}`}
                                            </Typography>
                                            {obj.impacted_stops && Array.isArray(obj.impacted_stops) && obj.impacted_stops.length > 0 && (
                                                <Box sx={{ ml: 2 }}>
                                                    <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>Arrêts impactés:</Typography>
                                                    <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.75rem' }}>
                                                        {obj.impacted_stops.map((stop, stopIndex) => (
                                                            <li key={stopIndex}>
                                                                {cleanLocationName(stop.name || stop.stop_point?.name || stop.stop_area?.name || stop.id || 'Arrêt inconnu')}
                                                            </li>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                            {obj.pt_object && (
                                                <Box sx={{ ml: 2, fontSize: '0.75rem' }}>
                                                    {obj.pt_object.name && <Typography><strong>Nom:</strong> {obj.pt_object.name}</Typography>}
                                                    {obj.pt_object.id && <Typography><strong>ID:</strong> {obj.pt_object.id}</Typography>}
                                                    {obj.pt_object.embedded_type && <Typography><strong>Type:</strong> {obj.pt_object.embedded_type}</Typography>}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            {disruption.application_periods && disruption.application_periods.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography fontWeight={600}>Période d'application:</Typography>
                                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                        {disruption.application_periods.map((period: ImpactApplicationPeriodsInner, periodIndex: number) => (
                                            <li key={periodIndex}>
                                                Du {period.begin ? new Date(period.begin).toLocaleString('fr-FR') : 'N/A'}
                                                {' '}au {period.end ? new Date(period.end).toLocaleString('fr-FR') : 'N/A'}
                                            </li>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Alert>
                    );
                })}
            </Collapse>
            {!showDisruptionsSection && (
                <Typography color="text.secondary" fontStyle="italic" sx={{ mt: 1 }}>
                    Cliquez sur le titre pour afficher les détails des perturbations.
                    Les perturbations sont également affichées dans le tableau ci-dessous.
                </Typography>
            )}
        </Paper>
    );
};

export default DisruptionsList;
