import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
    title: string;
    description: string;
    path: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color?: 'primary' | 'secondary';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, path, icon: Icon, color }) => {
    return (
        <Link to={path} className='dashboard-card-link'>
            <div className={`card dashboard-card ${color === 'primary' ? 'has-background-primary' : color === 'secondary' ? 'has-background-secondary' : ''}`}>
                <div className='card-content'>
                    <div className='media'>
                        <div className='media-left'>
                            <span className={`icon is-large ${color ? 'has-text-white' : ''}`}>
                                <Icon size={32} />
                            </span>
                        </div>
                        <div className='media-content'>
                            <p className={`title is-5 ${color ? 'has-text-white' : ''}`}>
                                {title}
                            </p>
                            <p className={`subtitle is-6 ${color ? 'has-text-white' : 'has-text-secondary'}`}>
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DashboardCard;

