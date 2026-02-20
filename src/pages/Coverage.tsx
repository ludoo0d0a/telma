import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress, Alert } from '@mui/material';
import Footer from '@/components/Footer';
import { PageHeader } from '@/components/skytrip';
import PageLayout from '@/components/shared/PageLayout';
import { getCoverage, getCoverageDetails } from '@/services/navitiaApi';
import type { CoverageResponse, Coverage } from '@/client/models';
import type { Link } from '@/client/models/link';
import type { Context } from '@/client/models/context';
import { CoverageContext, CoverageList, CoverageDetail } from '@/components/coverage';

interface SelectedCoverage extends Coverage {
    id: string;
    context?: Context;
    links?: Link[];
}

const CoveragePage: React.FC = () => {
    const [coverages, setCoverages] = useState<Coverage[]>([]);
    const [coverageResponse, setCoverageResponse] = useState<CoverageResponse | null>(null);
    const [selectedCoverage, setSelectedCoverage] = useState<SelectedCoverage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoverages = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await getCoverage();
                setCoverages(data.regions || []);
                setCoverageResponse(data);
                setError(null);
            } catch (err) {
                setError('Erreur lors du chargement des zones de couverture');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCoverages();
    }, []);

    const handleCoverageClick = async (coverageId: string | undefined): Promise<void> => {
        if (!coverageId) return;

        try {
            setLoading(true);
            const data = await getCoverageDetails(coverageId);
            setSelectedCoverage({ id: coverageId, ...data } as SelectedCoverage);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des détails');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Zones de couverture"
                subtitle="Consultez les régions et réseaux disponibles"
                showNotification={false}
            />
            <PageLayout>
                {loading && !selectedCoverage && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Chargement des zones de couverture...</Typography>
                    </Paper>
                )}

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !selectedCoverage && (
                    <>
                        {coverageResponse?.context && (
                            <CoverageContext context={coverageResponse.context} />
                        )}
                        <CoverageList
                            coverages={coverages}
                            coverageResponse={coverageResponse}
                            onCoverageClick={handleCoverageClick}
                        />
                    </>
                )}

                {selectedCoverage && (
                    <CoverageDetail
                        selectedCoverage={selectedCoverage}
                        onBack={() => setSelectedCoverage(null)}
                    />
                )}
            </PageLayout>
            <Footer />
        </>
    );
};

export default CoveragePage;
