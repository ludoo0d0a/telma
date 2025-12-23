import React from 'react';
import { Header } from '@/components/skytrip';

const RaiseIssue: React.FC = () => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Form submitted');
        // Here you would typically handle the form submission,
        // e.g., send the data to an API.
        alert('Thank you for your feedback!');
    };

    return (
        <div className="app-flight">
            <Header />

            <main>
                <div className="container" style={{ padding: '20px' }}>
                    <h2 className="title is-2">Raise an Issue</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label className="label">Name</label>
                            <div className="control">
                                <input className="input" type="text" placeholder="Your Name" required />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Email</label>
                            <div className="control">
                                <input className="input" type="email" placeholder="Your Email" required />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Issue Description</label>
                            <div className="control">
                                <textarea className="textarea" placeholder="Describe the issue in detail" required></textarea>
                            </div>
                        </div>

                        <div className="field">
                            <div className="control">
                                <button className="button is-primary" type="submit">Submit Issue</button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default RaiseIssue;
