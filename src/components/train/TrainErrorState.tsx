import React from 'react';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

interface TrainErrorStateProps {
    error: string | null;
    onRefresh: () => void;
    refreshing: boolean;
}

const TrainErrorState: React.FC<TrainErrorStateProps> = ({ error, onRefresh, refreshing }) => {
    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='box has-text-centered'>
                        <span className='icon is-large has-text-danger'>
                            <AlertTriangle size={48} />
                        </span>
                        <p className='mt-4 has-text-danger'>{error || 'Train non trouvé'}</p>
                        <div className='buttons is-centered mt-4'>
                            <button 
                                className='button is-primary' 
                                onClick={onRefresh}
                                disabled={refreshing}
                            >
                                <span className='icon'>
                                    {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                </span>
                                <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
                            </button>
                            <Link to='/train' className='button is-light'>
                                Rechercher un autre train
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default TrainErrorState;

