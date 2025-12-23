import React from 'react';
import { PageHeader } from '@/components/skytrip';
import { Clock, Ban, Wrench, HeartPulse, DoorClosed, MessageSquareWarning } from 'lucide-react';

const RaiseIssue: React.FC = () => {
    const issues = [
        { text: 'Delay', icon: <Clock size={48} /> },
        { text: 'Cancellation', icon: <Ban size={48} /> },
        { text: 'Broken Train', icon: <Wrench size={48} /> },
        { text: 'Sick Person', icon: <HeartPulse size={48} /> },
        { text: 'Closed Door', icon: <DoorClosed size={48} /> },
        { text: 'Other', icon: <MessageSquareWarning size={48} /> },
    ];

    const handleIssueClick = (issueText: string) => {
        console.log('Issue reported:', issueText);
        alert(`Thank you for reporting the issue: ${issueText}`);
    };

    return (
        <div className="app-flight">
            <PageHeader
                title="Raise an Issue"
                subtitle="Signalez un problème en quelques secondes"
                showNotification={false}
                
            />

            <main>
                <div className="container" style={{ padding: '20px' }}>
                    <h2 className="title is-2 has-text-centered">Raise an Issue</h2>
                    <div className="columns is-multiline is-mobile is-centered">
                        {issues.map((issue, index) => (
                            <div className="column is-half-mobile is-one-third-tablet" key={index}>
                                <button
                                    className="button is-large is-fullwidth is-flex is-flex-direction-column"
                                    onClick={() => handleIssueClick(issue.text)}
                                    style={{ height: '150px' }}
                                >
                                    <span className="icon is-large">{issue.icon}</span>
                                    <span>{issue.text}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RaiseIssue;
