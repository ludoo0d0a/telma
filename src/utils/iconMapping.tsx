import React from 'react';
import * as LucideIcons from 'lucide-react';

// Mapping Font Awesome icon names to Lucide React icon components
const iconMap: Record<string, keyof typeof LucideIcons> = {
  'fa-home': 'Home',
  'fa-route': 'Route',
  'fa-clock': 'Clock',
  'fa-map-marker-alt': 'MapPin',
  'fa-star': 'Star',
  'fa-train': 'Train',
  'fa-chart-bar': 'BarChart3',
  'fa-map': 'Map',
  'fa-circle': 'Circle',
  'fa-bus': 'Bus',
  'fa-book': 'Book',
  'fa-info-circle': 'Info',
  'fa-crosshairs': 'Crosshair',
  'fa-arrow-right': 'ArrowRight',
  'fa-times': 'X',
  'fa-search': 'Search',
  'fa-spinner': 'Loader2',
  'fa-exclamation-triangle': 'AlertTriangle',
  'fa-sync-alt': 'RefreshCw',
  'fa-arrow-down': 'ArrowDown',
  'fa-list-alt': 'List',
  'fa-code': 'Code',
  'fa-th-large': 'LayoutGrid',
  'fa-check-circle': 'CheckCircle2',
  'fa-stop': 'Square',
  'fa-exchange-alt': 'ArrowLeftRight',
  'fa-ban': 'Ban',
  'fa-ruler': 'Ruler',
  'fa-tag': 'Tag',
  'fa-external-link-alt': 'ExternalLink',
  'fa-chevron-right': 'ChevronRight',
  'fa-chevron-down': 'ChevronDown',
  'fa-chevron-up': 'ChevronUp',
  'fa-arrow-left': 'ArrowLeft',
  'fa-trash': 'Trash2',
  'fa-download': 'Download',
  'fa-book-open': 'BookOpen',
  'fa-chart-line': 'TrendingUp',
  'fa-mobile-alt': 'Smartphone',
  'fa-network-wired': 'Network',
  'fa-paint-brush': 'Palette',
  'fa-sitemap': 'Sitemap',
  'fa-tools': 'Wrench',
  'fa-vial': 'FlaskConical',
  'fa-cog': 'Settings',
  'fa-calculator': 'Calculator',
  'fa-history': 'History',
  'fa-flag-checkered': 'Flag',
  'fa-location-arrow': 'Navigation',
  'fa-tasks': 'CheckSquare',
  'fa-subway': 'Train',
  'fa-tram': 'TramFront',
  'fa-traffic-light': 'TrafficCone',
  'fa-ad': 'Info', // Using Info as fallback for ad icon
};

export interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  spin?: boolean;
}

/**
 * Icon component that maps Font Awesome icon names to Lucide React icons
 */
export const Icon: React.FC<IconProps> = ({ name, size = 16, className = '', spin = false }) => {
  // Remove 'fa-' prefix if present
  const iconKey = name.startsWith('fa-') ? name : `fa-${name}`;
  const LucideIconName = iconMap[iconKey];

  if (!LucideIconName) {
    console.warn(`Icon "${iconKey}" not found in mapping. Using Circle as fallback.`);
    const FallbackIcon = LucideIcons.Circle;
    return <FallbackIcon size={size} className={className} />;
  }

  const LucideIcon = LucideIcons[LucideIconName] as React.ComponentType<{
    size?: number | string;
    className?: string;
  }>;

  if (!LucideIcon) {
    console.warn(`Lucide icon "${LucideIconName}" not found. Using Circle as fallback.`);
    const FallbackIcon = LucideIcons.Circle;
    return <FallbackIcon size={size} className={className} />;
  }

  const iconClassName = spin 
    ? (className ? `${className} animate-spin` : 'animate-spin')
    : className;

  return <LucideIcon size={size} className={iconClassName} />;
};

/**
 * Helper to get icon size from Font Awesome size classes
 */
export const getSizeFromFaClass = (faClass?: string): number => {
  if (faClass?.includes('fa-2x')) return 32;
  if (faClass?.includes('fa-3x')) return 48;
  if (faClass?.includes('fa-lg')) return 24;
  return 16;
};

/**
 * Check if icon should spin based on Font Awesome classes
 */
export const shouldSpin = (faClass?: string): boolean => {
  return faClass?.includes('fa-spin') || false;
};

