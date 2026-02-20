import React from 'react';
import { Box, Container } from '@mui/material';

interface PageLayoutProps {
    children: React.ReactNode;
    /** When true, layout expands to fill viewport minus header. Default: false */
    fullHeight?: boolean;
    /** Max width: false = full, 'sm' | 'md' | 'lg' | 'xl' */
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

/**
 * Mobile-first page layout using MUI Container and Box.
 * Use for consistent page structure across the app.
 */
const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    fullHeight = false,
    maxWidth = 'md',
}) => {
    return (
        <Box
            component="section"
            sx={{
                minHeight: fullHeight ? { xs: 'calc(100vh - 200px)' } : 'auto',
                display: 'flex',
                flexDirection: 'column',
                py: 2,
                px: { xs: 2, sm: 3 },
            }}
        >
            <Container
                maxWidth={maxWidth}
                disableGutters
                sx={{
                    flex: fullHeight ? 1 : '0 1 auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {children}
            </Container>
        </Box>
    );
};

export default PageLayout;
