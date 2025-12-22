import React, { useState } from 'react';
import { AlertTriangle, ChevronUp, ChevronDown, Ban, Info, Clock } from 'lucide-react';
import type { Disruption } from '@/client/models/disruption';
import { cleanLocationName } from '@/services/locationService';
import type { ImpactApplicationPeriodsInner } from '@/client/models/impact-application-periods-inner';

interface DisruptionsListProps {
    disruptions: Disruption[];
}

const DisruptionsList: React.FC<DisruptionsListProps> = ({ disruptions }) => {
    const [showDisruptionsSection, setShowDisruptionsSection] = useState<boolean>(false);

    if (disruptions.length === 0) {
        return null;
    }

    return (
        <div className='box mb-5'>
            <h3
                className='title is-5 mb-4 is-clickable'
                onClick={() => setShowDisruptionsSection(!showDisruptionsSection)}
                style={{ cursor: 'pointer' }}
            >
                <span className='icon has-text-warning mr-2'>
                    <AlertTriangle size={20} />
                </span>
                Perturbations ({disruptions.length})
                <span className='icon ml-2'>
                    {showDisruptionsSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </span>
            </h3>
            {showDisruptionsSection && disruptions.map((disruption, index) => {
                // Handle severity - can be string, object with name, or object with other properties
                let severityText = 'unknown';
                if (typeof disruption.severity === 'string') {
                    severityText = disruption.severity;
                } else if (disruption.severity && typeof disruption.severity === 'object') {
                    severityText = (disruption.severity as { name?: string; label?: string }).name ||
                                  (disruption.severity as { name?: string; label?: string }).label ||
                                  JSON.stringify(disruption.severity);
                }

                const severityLevel = severityText.toLowerCase();

                // Determine notification type based on severity
                let notificationClass = 'is-warning';
                let IconComponent = AlertTriangle;
                if (severityLevel.includes('blocking') || severityLevel.includes('blocked') || severityLevel.includes('suspended')) {
                    notificationClass = 'is-danger';
                    IconComponent = Ban;
                } else if (severityLevel.includes('information') || severityLevel.includes('info') || severityLevel.includes('information')) {
                    notificationClass = 'is-info';
                    IconComponent = Info;
                } else if (severityLevel.includes('delay') || severityLevel.includes('retard')) {
                    notificationClass = 'is-warning';
                    IconComponent = Clock;
                }

                return (
                    <div key={index} className={`notification ${notificationClass} mb-3`}>
                        <div className='is-flex is-align-items-center mb-2'>
                            <span className='icon mr-2'>
                                <IconComponent size={20} />
                            </span>
                            <strong>
                                {severityText !== 'unknown' ? severityText : 'Perturbation'}
                            </strong>
                        </div>
                        {/* Display messages from messages array */}
                        {disruption.messages && Array.isArray(disruption.messages) && disruption.messages.length > 0 && (
                            <div className='content mb-2'>
                                {disruption.messages.map((msg, msgIndex) => (
                                    <p key={msgIndex} className='mb-2'>
                                        {msg.text || (msg as { message?: string }).message || JSON.stringify(msg)}
                                    </p>
                                ))}
                            </div>
                        )}
                        {/* Fallback to single message field if messages array doesn't exist */}
                        {(!disruption.messages || disruption.messages.length === 0) && disruption.message && (
                            <p className='mb-2'>{disruption.message}</p>
                        )}
                        {disruption.impacted_objects && disruption.impacted_objects.length > 0 && (
                            <div className='content is-small mt-2'>
                                <p className='has-text-weight-semibold'>Objets impactés:</p>
                                {disruption.impacted_objects.map((obj, objIndex) => (
                                    <div key={objIndex} className='mb-3'>
                                        <p className='has-text-weight-medium mb-1'>
                                            {obj.pt_object?.name || obj.pt_object?.id || `Objet ${objIndex + 1}`}
                                        </p>
                                        {/* Display impacted stops */}
                                        {obj.impacted_stops && Array.isArray(obj.impacted_stops) && obj.impacted_stops.length > 0 && (
                                            <div className='ml-3'>
                                                <p className='has-text-weight-semibold is-size-7 mb-1'>Arrêts impactés:</p>
                                                <ul className='is-size-7'>
                                                    {obj.impacted_stops.map((stop, stopIndex) => (
                                                        <li key={stopIndex}>
                                                            {cleanLocationName(stop.name || stop.stop_point?.name || stop.stop_area?.name || stop.id || 'Arrêt inconnu')}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {/* Display other pt_object properties */}
                                        {obj.pt_object && (
                                            <div className='ml-3 is-size-7'>
                                                {obj.pt_object.name && (
                                                    <p><strong>Nom:</strong> {obj.pt_object.name}</p>
                                                )}
                                                {obj.pt_object.id && (
                                                    <p><strong>ID:</strong> {obj.pt_object.id}</p>
                                                )}
                                                {obj.pt_object.embedded_type && (
                                                    <p><strong>Type:</strong> {obj.pt_object.embedded_type}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {disruption.application_periods && disruption.application_periods.length > 0 && (
                            <div className='content is-small mt-2'>
                                <p className='has-text-weight-semibold'>Période d'application:</p>
                                <ul>
                                    {disruption.application_periods.map((period, periodIndex) => (
                                        <li key={periodIndex}>
                                            Du {period.begin ? new Date(period.begin).toLocaleString('fr-FR') : 'N/A'}
                                            {' '}au {period.end ? new Date(period.end).toLocaleString('fr-FR') : 'N/A'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
            {!showDisruptionsSection && (
                <p className='has-text-grey is-italic'>
                    Cliquez sur le titre pour afficher les détails des perturbations.
                    Les perturbations sont également affichées dans le tableau ci-dessous.
                </p>
            )}
        </div>
    );
};

export default DisruptionsList;

