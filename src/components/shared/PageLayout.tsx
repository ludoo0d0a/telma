import React from 'react';
import { Box } from '@mui/material';

interface PageLayoutProps {
    children: React.ReactNode;
    /** When true, layout expands to fill viewport minus header. Default: false */
    fullHeight?: boolean;
}

/**
 * Mobile-first native-app layout: full width, minimal padding.
 * Uses safe-area padding only (16px horizontal, 8px vertical).
 */
const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    fullHeight = false,
}) => {
    return (
        <Box
            component="section"
            sx={{
                minHeight: fullHeight ? 'calc(100vh - 140px)' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                px: 2,
                py: 1,
            }}
        >
            {children}
        </Box>
    );
};

export default PageLayout;
