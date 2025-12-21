/// <reference types="vitest" />
/// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../../contexts/AuthContext';
import Home from '../../pages/Home';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <GoogleOAuthProvider clientId="test">
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

describe('Home', () => {
  it('should render the main title', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render the subtitle', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText(/Accédez rapidement aux principales fonctionnalités/i)).toBeInTheDocument();
  });

  it('should render main page cards', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Train')).toBeInTheDocument();
    expect(screen.getByText('Places')).toBeInTheDocument();
    expect(screen.getByText('Lignes')).toBeInTheDocument();
    expect(screen.getByText('Horaires')).toBeInTheDocument();
    expect(screen.getByText('Rapports')).toBeInTheDocument();
    expect(screen.getByText('Couverture')).toBeInTheDocument();
  });

  it('should render sample route cards', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Bettembourg → Metz')).toBeInTheDocument();
    expect(screen.getByText('Metz → Thionville')).toBeInTheDocument();
  });

  it('should render API documentation card', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
  });

  it('should have correct links to main pages', () => {
    renderWithRouter(<Home />);
    
    const trainLink = screen.getByText('Train').closest('a');
    expect(trainLink).toHaveAttribute('href', '/train');
    
    const placesLink = screen.getByText('Places').closest('a');
    expect(placesLink).toHaveAttribute('href', '/places');
  });

  it('should render section headers', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText('Pages Principales')).toBeInTheDocument();
    expect(screen.getByText('Exemples de Trajets')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
  });
});

