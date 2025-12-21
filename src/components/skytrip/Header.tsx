import React from 'react';
import { Bell } from 'lucide-react';
import './Header.scss';

interface HeaderProps {
    avatarUrl?: string;
    greeting?: string;
    userName?: string;
    showNotification?: boolean;
    onNotificationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    avatarUrl = "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    greeting = "Good Morning!",
    userName = "Andrew Ainsley",
    showNotification = true,
    onNotificationClick
}) => {
    return (
        <header className="skytrip-header">
            <div className="user-info">
                <img src={avatarUrl} alt="User Avatar" className="avatar" />
                <div>
                    <p>{greeting}</p>
                    <h2>{userName}</h2>
                </div>
            </div>
            {showNotification && (
                <button className="notification" onClick={onNotificationClick}>
                    <Bell size={24} />
                </button>
            )}
        </header>
    );
};

export default Header;

