import React from 'react';
import type { Coverage, CoverageResponse } from '@/client/models';
import CoverageCard from './CoverageCard';
import CoverageLinks from './CoverageLinks';

interface CoverageListProps {
    coverages: Coverage[];
    coverageResponse: CoverageResponse | null;
    onCoverageClick: (coverageId: string | undefined) => void;
}

const CoverageList: React.FC<CoverageListProps> = ({ coverages, coverageResponse, onCoverageClick }) => {
    return (
        <div className='box'>
            <h2 className='title is-4 mb-5'>
                Zones de couverture <span className='tag is-primary is-medium'>{coverages.length}</span>
            </h2>
            {coverages.length === 0 ? (
                <div className='has-text-centered'>
                    <p className='subtitle is-5'>Aucune zone de couverture trouvée</p>
                </div>
            ) : (
                <div className='columns is-multiline'>
                    {coverages.map((coverage) => (
                        <CoverageCard 
                            key={coverage.id} 
                            coverage={coverage} 
                            onClick={onCoverageClick}
                        />
                    ))}
                </div>
            )}

            {coverageResponse?.links && coverageResponse.links.length > 0 && (
                <div className='mt-5'>
                    <h3 className='title is-5 mb-3'>Liens disponibles</h3>
                    <div className='tags'>
                        {coverageResponse.links.map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='tag is-link is-medium'
                            >
                                {link.type || link.rel || 'Lien'}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoverageList;

