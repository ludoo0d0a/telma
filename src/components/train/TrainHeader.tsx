import React from 'react';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrainHeaderProps {
    trainNumber: string;
    onRefresh: () => void;
    refreshing: boolean;
}

const TrainHeader: React.FC<TrainHeaderProps> = ({ trainNumber, onRefresh, refreshing }) => {
    return (
        <div className='level mb-5'>
            <div className='level-left'>
                <div className='level-item'>
                    <h1 className='title is-2'>Détails du train</h1>
                    {trainNumber && trainNumber !== 'N/A' && (
                        <span className='ml-3 tag is-primary is-large'>{trainNumber}</span>
                    )}
                </div>
            </div>
            <div className='level-right'>
                <div className='level-item'>
                    <button 
                        className='button is-primary mr-2' 
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        <span className='icon'>
                            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        </span>
                        <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
                    </button>
                    <Link to='/train' className='button is-light'>
                        <span className='icon'><Search size={16} /></span>
                        <span>Rechercher</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrainHeader;

