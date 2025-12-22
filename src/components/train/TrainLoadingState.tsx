import React from 'react';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

const TrainLoadingState: React.FC = () => {
    return (
        <>
            <section className='section'>
                <div className='container'>
                    <div className='box has-text-centered'>
                        <span className='icon is-large'>
                            <Loader2 size={48} className="animate-spin" />
                        </span>
                        <p className='mt-4'>Chargement des détails du train...</p>
                    </div>
                </div>
            </section>
            <Footer />
        </>
    );
};

export default TrainLoadingState;

