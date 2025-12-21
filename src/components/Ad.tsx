import React from 'react';
import AdSense from 'react-adsense';
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
 * Uses environment variable VITE_GOOGLE_ADSENSE_ID for publisher ID
 * Set it in .env file: VITE_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXX
 * 
 * Use VITE_SHOW_ADS environment variable to control ad display:
 * Set VITE_SHOW_ADS=false to hide all ads, or VITE_SHOW_ADS=true to show them
 * 
 * Example usage:
 * <Ad format="auto" /> // Uses auto ads with publisher ID from env var
 * <Ad adSlot="1234567890" format="rectangle" /> // Uses specific ad unit
 */
const Ad: React.FC<AdProps> = ({ 
    adSlot,
    format = 'auto',
    size = 'responsive',
    className = '',
    style = {}
}) => {
    // Check if ads should be displayed
    const showAds = import.meta.env.VITE_SHOW_ADS !== 'false';
    
    // If ads are disabled, don't render anything
    if (!showAds) {
        return null;
    }

    const publisherId = import.meta.env.VITE_GOOGLE_ADSENSE_ID;

    // Show placeholder if no publisher ID is configured
    if (!publisherId || publisherId === 'ca-pub-1234567890123456' || publisherId === 'ca-pub-XXXXXXXXXXXXXXXX') {
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
            <AdSense.Google
                client={publisherId}
                slot={adSlot}
                style={{ display: 'block', ...style }}
                format={format === 'auto' ? 'auto' : undefined}
                responsive={size === 'responsive' ? 'true' : undefined}
            />
        </div>
    );
};

export default Ad;

