import React from 'react';
import { Paper, Typography, Box, Chip, Link } from '@mui/material';
import type { Link as LinkType } from '@/client/models/link';

interface CoverageLinksProps {
    links: LinkType[];
    title?: string;
}

const CoverageLinks: React.FC<CoverageLinksProps> = ({ links, title = 'Liens disponibles' }) => {
    if (!links || links.length === 0) return null;

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textDecoration: 'none' }}
                    >
                        <Chip
                            label={`${link.type || link.rel || 'Lien'}${link.templated ? ' (templated)' : ''}`}
                            component="span"
                            clickable
                        />
                    </Link>
                ))}
            </Box>
        </Paper>
    );
};

export default CoverageLinks;
