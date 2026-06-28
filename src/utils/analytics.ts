const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 * Should be called once when the app starts
 */
export const initGA = () => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    // GA will be initialized by vue-gtag plugin
    console.log('Google Analytics initialized with ID:', GA_TRACKING_ID);
  }
};

/**
 * Track a page view
 * @param path - The path of the page
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
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
  if (GA_TRACKING_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}



