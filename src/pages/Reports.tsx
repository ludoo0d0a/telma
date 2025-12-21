import React, { useState } from 'react';
import { Route, TrafficCone, Settings, Loader2, Download } from 'lucide-react';
import Footer from '../components/Footer';
import { getLineReports, getTrafficReports, getEquipmentReports } from '../services/navitiaApi';
import type { 
    CoverageCoverageLineReportsGet200Response,
    CoverageCoverageTrafficReportsGet200Response,
    CoverageCoverageEquipmentReportsGet200Response
} from '../client/models';

const Reports: React.FC = () => {
    const [reportType, setReportType] = useState<'line' | 'traffic' | 'equipment'>('traffic'); // 'line', 'traffic', 'equipment'
    const [filter, setFilter] = useState<string>('');
    const [reports, setReports] = useState<CoverageCoverageLineReportsGet200Response | CoverageCoverageTrafficReportsGet200Response | CoverageCoverageEquipmentReportsGet200Response | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (reportType === 'line' && !filter.trim()) {
            setError('Veuillez entrer un filtre pour les rapports de ligne');
            return;
        }

        try {
            setLoading(true);
            setError(null);
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
            <section className='section'>
                <div className='container'>
                    <div className='level mb-5'>
                        <div className='level-left'>
                            <div className='level-item'>
                                <h1 className='title is-2'>
                                    Rapports et <span>informations</span>
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className='box mb-5'>
                        <h3 className='title is-5 mb-4'>Type de rapport</h3>
                        <div className='tabs is-boxed mb-4'>
                            <ul>
                                <li className={reportType === 'line' ? 'is-active' : ''}>
                                    <a onClick={() => {
                                        setReportType('line');
                                        setReports(null);
                                        setError(null);
                                    }}>
                                        <span className='icon is-small'><Route size={16} /></span>
                                        <span>Rapports de ligne</span>
                                    </a>
                                </li>
                                <li className={reportType === 'traffic' ? 'is-active' : ''}>
                                    <a onClick={() => {
                                        setReportType('traffic');
                                        setReports(null);
                                        setError(null);
                                    }}>
                                        <span className='icon is-small'><TrafficCone size={16} /></span>
                                        <span>Rapports de trafic</span>
                                    </a>
                                </li>
                                <li className={reportType === 'equipment' ? 'is-active' : ''}>
                                    <a onClick={() => {
                                        setReportType('equipment');
                                        setReports(null);
                                        setError(null);
                                    }}>
                                        <span className='icon is-small'><Settings size={16} /></span>
                                        <span>Rapports d'équipement</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <form onSubmit={handleSearch}>
                            {(reportType === 'line' || reportType === 'equipment') && (
                                <div className='field'>
                                    <label className='label' htmlFor='filter'>
                                        Filtre {reportType === 'equipment' ? '(optionnel)' : '(requis)'}
                                    </label>
                                    <div className='control'>
                                        <input
                                            id='filter'
                                            className='input'
                                            type='text'
                                            value={filter}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
                                            placeholder='Ex: line.id=line:SNCF:1'
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='field'>
                                <div className='control'>
                                    <button type='submit' className='button is-primary' disabled={loading}>
                                        <span className='icon'>{loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}</span>
                                        <span>{loading ? 'Chargement...' : 'Récupérer les rapports'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {loading && (
                        <div className='box has-text-centered'>
                            <div className='loader-wrapper'>
                                <div className='loader is-loading'></div>
                            </div>
                            <p className='mt-4 subtitle is-5'>Chargement des rapports...</p>
                        </div>
                    )}

                    {error && (
                        <div className='notification is-danger'>
                            <button className='delete' onClick={() => setError(null)}></button>
                            <p className='title is-5'>Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && reports && (
                        <div className='box'>
                            <h2 className='title is-4 mb-5'>Résultats</h2>
                            <div className='content'>
                                <div className='table-container'>
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
                                    }}>{JSON.stringify(reports, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </>
    );
};

export default Reports;

