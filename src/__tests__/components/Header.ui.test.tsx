/// <reference types="vitest" />
/// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { SidebarProvider } from '@/contexts/SidebarContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <GoogleOAuthProvider clientId="test">
      <BrowserRouter>
        <SidebarProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </SidebarProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

describe('Header', () => {
  it('should render the header with logo and title', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText('Telma')).toBeInTheDocument();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('🚂 Train')).toBeInTheDocument();
    expect(screen.getByText('Lieux')).toBeInTheDocument();
    expect(screen.getByText('Lignes')).toBeInTheDocument();
    expect(screen.getByText('Horaires')).toBeInTheDocument();
  });

  it('should have a burger menu button', () => {
    renderWithProviders(<Header />);
    
    const burgerButton = screen.getByRole('button', { name: /menu/i });
    expect(burgerButton).toBeInTheDocument();
    expect(burgerButton).toHaveClass('navbar-burger');
  });

  it('should have correct link to home page', () => {
    renderWithProviders(<Header />);
    
    const homeLinks = screen.getAllByText('Accueil');
    homeLinks.forEach(link => {
      const parent = link.closest('a');
      if (parent) {
        expect(parent).toHaveAttribute('href', '/');
      }
    });
  });
});

