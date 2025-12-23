import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Search, Bell } from 'lucide-react';
import { useSidebar } from '@/contexts/SidebarContext';
import Avatar from '@/components/Avatar';
import './PageHeader.scss';

interface PageHeaderProps {
    title: string;
    leftAction?: 'menu' | 'back';
    showBack?: boolean;
    backUrl?: string;
    onBack?: () => void;
    onMenu?: () => void;
    showSearch?: boolean;
    onSearch?: () => void;
    showMenu?: boolean;
    showAvatar?: boolean;
    showNotification?: boolean;
    /** When true, highlights the bell with a badge to indicate pending notifications. */
    hasPendingNotifications?: boolean;
    avatarUrl?: string;
    onAvatarClick?: () => void;
    onNotificationClick?: () => void;
    variant?: 'default' | 'with-route';
    children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    leftAction,
    showBack = false,
    backUrl,
    onBack,
    onMenu,
    showSearch = false,
    onSearch,
    showAvatar = true,
    showNotification = true,
    hasPendingNotifications = false,
    avatarUrl = 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    onAvatarClick,
    onNotificationClick,
    children
}) => {
    const navigate = useNavigate();
    const { toggleSidebar } = useSidebar();
    const resolvedLeftAction = leftAction ?? (showBack ? 'back' : 'menu');

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backUrl) {
            navigate(backUrl);
        } else {
            navigate(-1);
        }
    };

    const handleMenu = () => {
        if (onMenu) {
            onMenu();
            return;
        }

        // Default to toggling the shared sidebar drawer when no handler is provided.
        toggleSidebar();
    };

    return (
        <header className='skytrip-page-header'>
            <div className="header-top">
                <div className="left-actions">
                    {resolvedLeftAction === 'back' ? (
                        <button onClick={handleBack} className="icon-button back-button">
                            <ArrowLeft size={20} strokeWidth={2} />
                        </button>
                    ) : (
                        <button onClick={handleMenu} className="icon-button menu-button">
                            <Menu size={20} strokeWidth={2} />
                        </button>
                    )}
                </div>

                <h1>{title}</h1>

                <div className="right-actions">
                    {showSearch && (
                        <button className="icon-button search-button" onClick={onSearch}>
                            <Search size={20} strokeWidth={2} />
                        </button>
                    )}
                    {showNotification && (
                        <button
                            className={`icon-button notification${hasPendingNotifications ? ' is-pending' : ''}`}
                            onClick={onNotificationClick}
                        >
                            <Bell size={20} />
                        </button>
                    )}
                    {showAvatar && (
                        <div className="avatar-wrapper">
                            <Avatar
                                variant="compact"
                                fallbackPicture={avatarUrl}
                                fallbackName={title}
                            />
                        </div>
                    )}
                </div>
            </div>

        {children}
        </header>
    );
};

export default PageHeader;

