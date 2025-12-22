/// <reference types="vitest" />
/// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BottomNavbar from '@/components/BottomNavbar';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('BottomNavbar', () => {
  it('should render all navigation items', () => {
    renderWithRouter(<BottomNavbar onMoreClick={() => {}} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Trajet')).toBeInTheDocument();
    expect(screen.getByText('Horaires')).toBeInTheDocument();
    expect(screen.getByText('Lieux')).toBeInTheDocument();
    expect(screen.getByText('Favoris')).toBeInTheDocument();
  });

  it('should have correct navigation links', () => {
    renderWithRouter(<BottomNavbar onMoreClick={() => {}} />);
    
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
    
    const trajetLink = screen.getByText('Trajet').closest('a');
    expect(trajetLink).toHaveAttribute('href', '/itinerary');
    
    const schedulesLink = screen.getByText('Horaires').closest('a');
    expect(schedulesLink).toHaveAttribute('href', '/schedules');
    
    const placesLink = screen.getByText('Lieux').closest('a');
    expect(placesLink).toHaveAttribute('href', '/places');
    
    const favoritesLink = screen.getByText('Favoris').closest('a');
    expect(favoritesLink).toHaveAttribute('href', '/favorites');
  });

  it('should have navigation role', () => {
    renderWithRouter(<BottomNavbar onMoreClick={() => {}} />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'main navigation');
  });
});

