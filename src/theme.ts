import { createTheme } from '@mui/material/styles';

/**
 * Mobile-first theme for Telma.
 * MUI breakpoints are mobile-first by default (xs: 0px).
 * Use theme.breakpoints.up('sm') for tablet and above.
 */
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,    // Mobile portrait
      sm: 600,  // Mobile landscape / small tablet
      md: 900,  // Tablet
      lg: 1200, // Desktop
      xl: 1536, // Large desktop
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Mobile-first: base sizes tuned for small screens
    h4: { fontSize: '1.5rem' },
    h5: { fontSize: '1.25rem' },
    h6: { fontSize: '1rem' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Ensure touch targets are at least 44px on mobile
          WebkitTapHighlightColor: 'transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // Touch-friendly on mobile
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
  },
});

export default theme;
