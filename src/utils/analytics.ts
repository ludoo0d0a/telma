const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID;

/**
 * Initialize Google Analytics
 * Should be called once when the app starts
 */
export const initGA = () => {
  if (GA_TRACKING_ID && typeof window !== 'undefined') {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);
    
    console.log('Google Analytics tracking ID:', GA_TRACKING_ID);
  }
};

/**
 * Track a page view
 * @param path - The path of the page
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string) => {
  if (GA_TRACKING_ID && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
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
  if (GA_TRACKING_ID && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}
