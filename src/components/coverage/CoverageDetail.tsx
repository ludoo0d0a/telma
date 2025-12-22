import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Context } from '@/client/models/context';
import type { Link } from '@/client/models/link';
import type { Coverage } from '@/client/models';
import { formatDateString } from '@/utils/dateUtils';
import CoverageContext from './CoverageContext';
import CoverageLinks from './CoverageLinks';
import { getStatusBadge } from './coverageUtils';

interface SelectedCoverage extends Coverage {
    id: string;
    context?: Context;
    links?: Link[];
}

interface CoverageDetailProps {
    selectedCoverage: SelectedCoverage;
    onBack: () => void;
}

const CoverageDetail: React.FC<CoverageDetailProps> = ({ selectedCoverage, onBack }) => {
    return (
        <div className='box'>
            <div className='level mb-5'>
                <div className='level-left'>
                    <div className='level-item'>
                        <button
                            className='button is-light'
                            onClick={onBack}
                        >
                            <span className='icon'><ArrowLeft size={20} /></span>
                            <span>Retour à la liste</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className='level mb-5'>
                <div className='level-left'>
                    <div className='level-item'>
                        <h2 className='title is-3'>Détails: {selectedCoverage.id}</h2>
                    </div>
                </div>
                {selectedCoverage.status && (
                    <div className='level-right'>
                        <div className='level-item'>
                            {getStatusBadge(selectedCoverage.status)}
                        </div>
                    </div>
                )}
            </div>

            <div className='content'>
                <div className='box mb-5'>
                    <h3 className='title is-5 mb-4'>Informations générales</h3>
                    <div className='content'>
                        {selectedCoverage.id && (
                            <p><strong>ID:</strong> <code>{selectedCoverage.id}</code></p>
                        )}
                        {selectedCoverage.start_production_date && (
                            <p><strong>Date de début de production:</strong> {formatDateString(selectedCoverage.start_production_date)}</p>
                        )}
                        {selectedCoverage.end_production_date && (
                            <p><strong>Date de fin de production:</strong> {formatDateString(selectedCoverage.end_production_date)}</p>
                        )}
                        {selectedCoverage.status && (
                            <p><strong>Statut:</strong> {selectedCoverage.status}</p>
                        )}
                    </div>
                </div>

                {selectedCoverage.shape && (
                    <div className='box mb-5'>
                        <h3 className='title is-5 mb-4'>Forme géographique</h3>
                        <div className='content'>
                            <pre>{selectedCoverage.shape}</pre>
                        </div>
                    </div>
                )}

                {selectedCoverage.context && (
                    <CoverageContext context={selectedCoverage.context} />
                )}

                {selectedCoverage.links && selectedCoverage.links.length > 0 && (
                    <CoverageLinks links={selectedCoverage.links} />
                )}

                <div className='box'>
                    <details>
                        <summary className='title is-6 mb-4' style={{ cursor: 'pointer' }}>Afficher les données JSON brutes</summary>
                        <div className='content mt-4'>
                            <pre style={{
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '10px',
                                padding: '1.5rem',
                                overflow: 'auto',
                                color: '#ccc',
                                fontFamily: "'Roboto Mono', monospace",
                                fontSize: '0.9rem',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word'
                            }}>{JSON.stringify(selectedCoverage, null, 2)}</pre>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default CoverageDetail;

