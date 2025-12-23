import React from 'react';
import DashboardCard from './DashboardCard';

interface DashboardCardData {
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color?: 'primary' | 'secondary';
}

interface DashboardSectionProps {
    title: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    cards: DashboardCardData[];
    columnsClass?: string;
    columnsWrapperClassName?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
    title,
    icon: Icon,
    cards,
    columnsClass = 'is-one-third-tablet is-half-mobile',
    columnsWrapperClassName = ''
}) => {
    return (
        <div className='skytrip-search-card mb-6'>
            <h2 className='title is-3 mb-4'>
                <span className='icon mr-2'>
                    <Icon size={24} />
                </span>
                {title}
            </h2>
            <div className={`columns is-multiline ${columnsWrapperClassName}`.trim()}>
                {cards.map((card) => (
                    <div key={card.path} className={`column ${columnsClass}`}>
                        <DashboardCard {...card} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardSection;

