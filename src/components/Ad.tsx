import React from 'react';
import { Info } from 'lucide-react';

interface AdProps {
    /**
     * AdSense ad unit slot ID (e.g., '1234567890')
     * Optional - if not provided, uses auto ads
     */
    adSlot?: string;
    /**
     * Ad format: 'auto', 'rectangle', 'horizontal', 'vertical', or custom dimensions
     */
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | string;
    /**
     * Ad size: 'responsive' or specific dimensions like '300x250'
     */
    size?: 'responsive' | string;
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * Style object
     */
    style?: React.CSSProperties;
}

/**
 * Google AdSense Ad Component
 *
 * Pure function implementation of AdSense ads.
 * Uses environment variable VITE_GOOGLE_ADSENSE_ID for publisher ID.
 * Set VITE_SHOW_ADS=false to hide all ads.
 */
const Ad: React.FC<AdProps> = ({
    adSlot = '5391792359',
    format = 'auto',
    size = 'responsive',
    className = '',
    style = {}
}) => {
    const showAds = import.meta.env.VITE_SHOW_ADS !== 'false';
    const publisherId = import.meta.env.VITE_GOOGLE_ADSENSE_ID;

    // Enable test mode on localhost to see ads during development
    const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.startsWith('192.168.'));
    const enableTestMode = isLocalhost;

    // If ads are disabled, don't render anything
    if (!showAds) {
        return null;
    }

    // Show placeholder if no publisher ID is configured
    if (!publisherId || publisherId.trim() === '') {
        return (
            <div
                className={`ad-container ad-placeholder ${className}`}
                style={style}
            >
                <div className="ad-placeholder-content">
                    <p className="has-text-grey is-size-7">
                        <Info size={16} className="mr-2" />
                        Ad space - Configure VITE_GOOGLE_ADSENSE_ID in .env file
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`ad-container ${className}`}
            style={style}
        >
            <ins
                className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client={publisherId}
                data-ad-slot={adSlot}
                data-ad-format={format === 'auto' ? 'auto' : undefined}
                data-full-width-responsive={size === 'responsive' ? 'true' : 'false'}
                data-adtest={enableTestMode ? 'on' : undefined}
            />
        </div>
    );
};

export default Ad;
