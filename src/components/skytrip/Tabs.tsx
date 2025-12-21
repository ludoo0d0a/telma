import React from 'react';
import './Tabs.scss';

interface Tab {
    label: string;
    value: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (value: string) => void;
    variant?: 'default' | 'rounded';
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, variant = 'default' }) => {
    const className = `skytrip-tabs ${variant === 'rounded' ? 'rounded' : ''}`;
    
    return (
        <div className={className}>
            {tabs.map((tab) => (
                <button
                    key={tab.value}
                    className={`tab-button ${activeTab === tab.value ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.value)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;

