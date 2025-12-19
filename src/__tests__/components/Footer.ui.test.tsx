/// <reference types="vitest" />
/// @vitest-environment happy-dom

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer', () => {
  it('should render copyright information', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    expect(screen.getByText(/SNCF API Explorer/i)).toBeInTheDocument();
  });

  it('should render powered by Navitia API text', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Powered by Navitia API/i)).toBeInTheDocument();
  });

  it('should render version information', () => {
    render(<Footer />);
    
    expect(screen.getByText(/Version/i)).toBeInTheDocument();
  });
});

