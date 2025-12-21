import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, Plane } from 'lucide-react';
import './PageHeader.scss';

interface PageHeaderProps {
    title: string;
    showBack?: boolean;
    backUrl?: string;
    onBack?: () => void;
    showSearch?: boolean;
    onSearch?: () => void;
    showMenu?: boolean;
    onMenu?: () => void;
    variant?: 'default' | 'with-route';
    route?: {
        from: { name: string; code: string };
        to: { name: string; code: string };
        duration?: string;
    };
    selectedDate?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    showBack = true,
    backUrl,
    onBack,
    showSearch = false,
    onSearch,
    showMenu = false,
    onMenu,
    variant = 'default',
    route,
    selectedDate
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backUrl) {
            navigate(backUrl);
        } else {
            navigate(-1);
        }
    };

    return (
        <header className={`skytrip-page-header ${variant}`}>
            <div className="header-top">
                {showBack && (
                    <button onClick={handleBack} className="back-button">
                        <ArrowLeft size={20} strokeWidth={2} />
                    </button>
                )}
                <h1>{title}</h1>
                {showSearch && (
                    <button className="search-button" onClick={onSearch}>
                        <Search size={20} strokeWidth={2} />
                    </button>
                )}
                {showMenu && (
                    <button className="menu-button" onClick={onMenu}>
                        <MoreVertical size={20} strokeWidth={2} />
                    </button>
                )}
            </div>

            {variant === 'with-route' && route && (
                <>
                    <div className="flight-route">
                        <div className="location">
                            <h2>{route.from.name}</h2>
                            <p className="code">{route.from.code}</p>
                        </div>
                        <div className="route-connector">
                            <div className="dotted-line"></div>
                            <div className="plane-icon">
                                <Plane size={20} strokeWidth={2} />
                            </div>
                            {route.duration && <p className="duration">{route.duration}</p>}
                        </div>
                        <div className="location">
                            <h2>{route.to.name}</h2>
                            <p className="code">{route.to.code}</p>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="selected-date">
                            <p>{selectedDate}</p>
                        </div>
                    )}
                </>
            )}
        </header>
    );
};

export default PageHeader;

