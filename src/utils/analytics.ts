import ReactGA from 'react-ga4';

const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

/**
 * Initialize Google Analytics
 * Should be called once when the app starts
 */
export const initGA = () => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.initialize(GA_TRACKING_ID, {
      testMode: import.meta.env.DEV, // Disable in development
    });
  }
};

/**
 * Track a page view
 * @param path - The path of the page
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }
};

/**
 * Track a custom event
 * @param category - Event category
 * @param action - Event action
 * @param label - Optional event label
 * @param value - Optional numeric value
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

/**
 * Load Google AdSense script conditionally
 * Only loads if ads are enabled and publisher ID is configured
 */
let adsenseScriptLoaded = false;

export const loadAdSenseScript = () => {
  // Check if script is already loaded or being loaded
  if (adsenseScriptLoaded || typeof window === 'undefined') {
    return;
  }

  // Check if ads should be displayed
  const showAds = import.meta.env.VITE_SHOW_ADS !== 'false';
  const publisherId = import.meta.env.VITE_GOOGLE_ADSENSE_ID;
  
  // Only load script if ads are enabled and publisher ID is configured
  if (!showAds || !publisherId || publisherId.trim() === '') {
    return;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
  if (existingScript) {
    adsenseScriptLoaded = true;
    return;
  }

  // Load the AdSense script dynamically
  const script = document.createElement('script');
  script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    adsenseScriptLoaded = true;
  };
  script.onerror = () => {
    console.warn('Failed to load Google AdSense script');
  };
  document.head.appendChild(script);
};

