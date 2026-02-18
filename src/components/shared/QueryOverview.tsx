import React from 'react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';

interface QueryOverviewProps {
    // For itinerary-style queries
    fromName?: string;
    toName?: string;
    filterDate?: string;
    filterTime?: string;
    // For text-based queries
    query?: string;
    queryLabel?: string;
    // Common
    onClick: () => void;
}

const QueryOverview: React.FC<QueryOverviewProps> = ({
    fromName,
    toName,
    filterDate,
    filterTime,
    query,
    queryLabel,
    onClick,
}) => {
    const formatDate = (dateStr: string): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); // HH:MM
    };

    // Text-based query (Places, etc.)
    if (query !== undefined) {
        return (
            <button
                onClick={onClick}
                className="button is-light is-fullwidth mb-4"
                style={{
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    height: 'auto',
                    padding: '0.75rem 1rem',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                }}
            >
                <div className="is-flex is-align-items-center is-justify-content-space-between" style={{ width: '100%', gap: '0.5rem' }}>
                    <div className="is-flex is-align-items-center" style={{ flex: 1, minWidth: 0 }}>
                        <span className="icon is-small mr-2" style={{ flexShrink: 0 }}>
                            <ArrowLeft size={16} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            {queryLabel && (
                                <div className="is-size-7 has-text-grey mb-1">
                                    {queryLabel}
                                </div>
                            )}
                            <div 
                                className="has-text-weight-semibold" 
                                style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap'
                                }}
                                title={query}
                            >
                                {query || 'Recherche'}
                            </div>
                        </div>
                    </div>
                    <span className="icon is-small ml-2" style={{ flexShrink: 0 }}>
                        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </span>
                </div>
            </button>
        );
    }

    // Itinerary-style query (from/to)
    return (
        <button
            onClick={onClick}
            className="button is-light is-fullwidth mb-4"
            style={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: 'auto',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
            }}
        >
            <div className="is-flex is-align-items-center is-justify-content-space-between" style={{ width: '100%', gap: '0.5rem' }}>
                <div className="is-flex is-align-items-center" style={{ flex: 1, minWidth: 0 }}>
                    <span className="icon is-small mr-2" style={{ flexShrink: 0 }}>
                        <ArrowLeft size={16} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div className="is-flex is-align-items-center" style={{ gap: '0.5rem', flexWrap: 'nowrap' }}>
                            <span 
                                className="has-text-weight-semibold" 
                                style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    maxWidth: '40%'
                                }}
                                title={fromName || 'Départ'}
                            >
                                {fromName || 'Départ'}
                            </span>
                            <span className="icon is-small" style={{ flexShrink: 0 }}>
                                <ArrowRight size={14} />
                            </span>
                            <span 
                                className="has-text-weight-semibold" 
                                style={{ 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap',
                                    maxWidth: '40%'
                                }}
                                title={toName || 'Arrivée'}
                            >
                                {toName || 'Arrivée'}
                            </span>
                        </div>
                        {(filterDate || filterTime) && (
                            <div className="is-size-7 has-text-grey mt-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {filterDate && formatDate(filterDate)}
                                {filterDate && filterTime && ' • '}
                                {filterTime && formatTime(filterTime)}
                            </div>
                        )}
                    </div>
                </div>
                <span className="icon is-small ml-2" style={{ flexShrink: 0 }}>
                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                </span>
            </div>
        </button>
    );
};

export default QueryOverview;
