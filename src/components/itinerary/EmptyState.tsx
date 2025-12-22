import React from 'react';

interface EmptyStateProps {
    fromName: string;
    toName: string;
    fromId: string | undefined;
    toId: string | undefined;
}

const EmptyState: React.FC<EmptyStateProps> = ({ fromName, toName, fromId, toId }) => {
    return (
        <div className='box has-text-centered'>
            <div className='content'>
                <span className='icon is-large has-text-warning mb-4' style={{fontSize: '4rem'}}>🚂</span>
                <h2 className='title is-4'>Aucun train trouvé</h2>
                <p className='subtitle is-6 has-text-grey'>
                    Il n'y a actuellement aucun train disponible entre {fromName || 'la gare de départ'} et {toName || 'la gare d\'arrivée'} pour les prochains jours.
                </p>
                <div className='content has-text-left mt-5'>
                    <div className='message is-info'>
                        <div className='message-header'>
                            <p>Informations</p>
                        </div>
                        <div className='message-body'>
                            <ul>
                                <li>Gare de départ: <strong>{fromId ? `${fromName} (trouvée)` : `${fromName || 'Non sélectionnée'} (non trouvée)`}</strong></li>
                                <li>Gare d'arrivée: <strong>{toId ? `${toName} (trouvée)` : `${toName || 'Non sélectionnée'} (non trouvée)`}</strong></li>
                                <li>Période recherchée: Aujourd'hui et les 2 prochains jours</li>
                            </ul>
                        </div>
                    </div>
                    <div className='notification is-warning is-light mt-4'>
                        <p>
                            <strong>Suggestion:</strong> Essayez de vérifier les horaires directement sur le site SNCF ou contactez le service client.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;

