import React from 'react';
import type { Coverage } from '@/client/models';
import { formatDateString } from '@/utils/dateUtils';
import { getStatusBadge } from './coverageUtils';

interface CoverageCardProps {
    coverage: Coverage;
    onClick: (coverageId: string | undefined) => void;
}

const CoverageCard: React.FC<CoverageCardProps> = ({ coverage, onClick }) => {
    return (
        <div className='column is-half-tablet is-one-third-desktop'>
            <div 
                className='box is-clickable' 
                onClick={() => onClick(coverage.id)} 
                style={{ cursor: 'pointer' }}
            >
                <h3 className='title is-5 mb-3'>{coverage.id}</h3>
                <div className='content'>
                    <div className='mb-3'>
                        {getStatusBadge(coverage.status)}
                    </div>
                    {coverage.start_production_date && (
                        <p><strong>Début:</strong> {formatDateString(coverage.start_production_date)}</p>
                    )}
                    {coverage.end_production_date && (
                        <p><strong>Fin:</strong> {formatDateString(coverage.end_production_date)}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoverageCard;

