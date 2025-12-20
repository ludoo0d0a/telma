import React, { useEffect, useRef } from 'react';
import { Icon } from '../utils/iconMapping';

interface AdProps {
    /**
     * AdSense publisher ID (e.g., 'ca-pub-1234567890123456')
     * Replace with your actual AdSense publisher ID
     * This should be set once in index.html, but can be overridden here
     */
    adClient?: string;
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
 * To use this component:
 * 1. Get your AdSense publisher ID from https://www.google.com/adsense
 * 2. Replace the publisher ID in index.html with your actual ID
 * 3. (Optional) Create ad units in AdSense and use their slot IDs
 * 4. Make sure your site is approved by AdSense
 * 
 * Example usage:
 * <Ad format="auto" /> // Uses auto ads with publisher ID from index.html
 * <Ad adSlot="1234567890" format="rectangle" /> // Uses specific ad unit
 */
const Ad: React.FC<AdProps> = ({ 
    adClient,
    adSlot,
    format = 'auto',
    size = 'responsive',
    className = '',
    style = {}
}) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if AdSense script is loaded
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
            try {
                // Push ad to AdSense
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (err) {
                console.error('Error loading AdSense ad:', err);
            }
        }
    }, []);

    // Get publisher ID from script tag or use provided one
    const getPublisherId = (): string | null => {
        if (adClient) return adClient;
        
        // Try to extract from script tag
        if (typeof document !== 'undefined') {
            const script = document.querySelector('script[src*="adsbygoogle"]');
            if (script) {
                const src = script.getAttribute('src') || '';
                const match = src.match(/client=([^&]+)/);
                if (match && match[1]) {
                    return match[1];
                }
            }
        }
        
        return null;
    };

    const publisherId = getPublisherId();

    // Show placeholder if no publisher ID is configured
    if (!publisherId || publisherId === 'ca-pub-1234567890123456') {
        return (
            <div 
                className={`ad-container ad-placeholder ${className}`}
                style={style}
            >
                <div className="ad-placeholder-content">
                    <p className="has-text-grey is-size-7">
                        <Icon name="fa-info-circle" size={16} className="mr-2" />
                        Ad space - Configure your AdSense publisher ID in index.html
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={adRef}
            className={`ad-container ${className}`}
            style={style}
        >
            <ins
                className="adsbygoogle"
                style={{
                    display: 'block',
                    ...style
                }}
                data-ad-client={publisherId}
                data-ad-slot={adSlot}
                data-ad-format={format}
                data-full-width-responsive={size === 'responsive' ? 'true' : undefined}
            />
        </div>
    );
};

export default Ad;

