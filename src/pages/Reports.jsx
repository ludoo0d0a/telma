import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getLineReports, getTrafficReports, getEquipmentReports } from '../services/navitiaApi';

const Reports = () => {
    const [reportType, setReportType] = useState('traffic'); // 'line', 'traffic', 'equipment'
    const [filter, setFilter] = useState('');
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (reportType === 'line' && !filter.trim()) {
            setError('Veuillez entrer un filtre pour les rapports de ligne');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            let data;

            let response;
            switch (reportType) {
                case 'line':
                    response = await getLineReports(filter);
                    break;
                case 'traffic':
                    response = await getTrafficReports();
                    break;
                case 'equipment':
                    response = await getEquipmentReports('sncf', filter || null);
                    break;
                default:
                    throw new Error('Type de rapport invalide');
            }

            setReports(response.data);
        } catch (err) {
            setError('Erreur lors de la récupération des rapports');
            console.error(err);
            setReports(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className='reports-page'>
                <div className='reports-page__content-wrapper'>
                    <h1 className='reports-page__title'>
                        Rapports et <span>informations</span>
                    </h1>
                    <Link to='/' className='home__link'>
                        Accueil
                    </Link>

                    <div className='report-tabs'>
                        <button
                            className={`tab-button ${reportType === 'line' ? 'active' : ''}`}
                            onClick={() => {
                                setReportType('line');
                                setReports(null);
                                setError(null);
                            }}
                        >
                            Rapports de ligne
                        </button>
                        <button
                            className={`tab-button ${reportType === 'traffic' ? 'active' : ''}`}
                            onClick={() => {
                                setReportType('traffic');
                                setReports(null);
                                setError(null);
                            }}
                        >
                            Rapports de trafic
                        </button>
                        <button
                            className={`tab-button ${reportType === 'equipment' ? 'active' : ''}`}
                            onClick={() => {
                                setReportType('equipment');
                                setReports(null);
                                setError(null);
                            }}
                        >
                            Rapports d'équipement
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className='reports-form'>
                        {(reportType === 'line' || reportType === 'equipment') && (
                            <div className='form-group'>
                                <label htmlFor='filter'>
                                    Filtre {reportType === 'equipment' ? '(optionnel)' : '(requis)'}
                                </label>
                                <input
                                    id='filter'
                                    type='text'
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    placeholder='Ex: line.id=line:SNCF:1'
                                    className='form-input'
                                />
                            </div>
                        )}

                        <button type='submit' className='form-button' disabled={loading}>
                            {loading ? 'Chargement...' : 'Récupérer les rapports'}
                        </button>
                    </form>

                    {error && (
                        <div className='error'>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && reports && (
                        <div className='reports-result'>
                            <h2>Résultats</h2>
                            <div className='reports-content'>
                                <pre>{JSON.stringify(reports, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Reports;

