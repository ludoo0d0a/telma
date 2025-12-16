import React from 'react';
import { Link } from 'react-router-dom';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import Footer from '../components/Footer';
import Header from '../components/Header';

const SwaggerUIPage = () => {
    return (
        <>
            <Header />
            <div className='swagger-page'>
                <div className='swagger-page__header'>
                    <h1 className='swagger-page__title'>
                        API <span>Documentation</span>
                    </h1>
                    <Link to='/' className='home__link'>
                        Accueil
                    </Link>
                </div>
                <div className='swagger-page__content'>
                    <SwaggerUI
                        url={`${import.meta.env.BASE_URL || ''}/openapi.json`}
                        docExpansion="list"
                        defaultModelsExpandDepth={1}
                        defaultModelExpandDepth={1}
                        persistAuthorization={true}
                        requestInterceptor={(request) => {
                            // Add API key to all requests
                            if (import.meta.env.VITE_API_KEY) {
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

