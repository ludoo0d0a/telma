import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import Footer from '@/components/Footer';

const SwaggerUIPage: React.FC = () => {
    return (
        <>
            <div className='swagger-page'>
                <div className='swagger-page__header'>
                    <h1 className='swagger-page__title'>
                        API <span>Documentation</span>
                    </h1>
                </div>
                <div className='swagger-page__content'>
                    <SwaggerUI
                        url={`${import.meta.env.BASE_URL || ''}/openapi.json`}
                        docExpansion="list"
                        defaultModelsExpandDepth={1}
                        defaultModelExpandDepth={1}
                        persistAuthorization={true}
                        requestInterceptor={(request: { headers?: Record<string, string> }) => {
                            // Add API key to all requests
                            if (import.meta.env.VITE_API_KEY) {
                                if (!request.headers) {
                                    request.headers = {};
                                }
                                request.headers['Authorization'] = import.meta.env.VITE_API_KEY;
                            }
                            return request;
                        }}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default SwaggerUIPage;

