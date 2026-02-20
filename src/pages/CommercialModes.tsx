import React, { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { getCommercialModes } from '@/services/navitiaApi';
import type { CommercialMode } from '@/client/models/commercial-mode';
import CommercialModesLoadingState from '@/components/commercialModes/CommercialModesLoadingState';
import CommercialModesErrorState from '@/components/commercialModes/CommercialModesErrorState';
import CommercialModesList from '@/components/commercialModes/CommercialModesList';
import PageLayout from '@/components/shared/PageLayout';

const CommercialModes: React.FC = () => {
    const [modes, setModes] = useState<CommercialMode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModes = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await getCommercialModes();
                setModes(data.commercial_modes || []);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des modes de transport');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchModes();
    }, []);

    return (
        <>
            <PageLayout>
                {loading && <CommercialModesLoadingState />}

                {error && (
                    <CommercialModesErrorState
                        error={error}
                        onDismiss={() => setError(null)}
                    />
                )}

                {!loading && !error && <CommercialModesList modes={modes} />}
            </PageLayout>
            <Footer />
        </>
    );
};

export default CommercialModes;
