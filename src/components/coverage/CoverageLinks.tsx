import React from 'react';
import type { Link } from '@/client/models/link';

interface CoverageLinksProps {
    links: Link[];
    title?: string;
}

const CoverageLinks: React.FC<CoverageLinksProps> = ({ links, title = 'Liens disponibles' }) => {
    if (!links || links.length === 0) return null;

    return (
        <div className='box mb-5'>
            <h3 className='title is-5 mb-4'>{title}</h3>
            <div className='tags'>
                {links.map((link, index) => (
                    <a
                        key={index}
                        href={link.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='tag is-link is-medium'
                    >
                        {link.type || link.rel || 'Lien'} {link.templated && '(templated)'}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default CoverageLinks;

