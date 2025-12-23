import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogIn, LogOut, Settings, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

type AvatarVariant = 'default' | 'compact';

interface AvatarProps {
  variant?: AvatarVariant;
  fallbackPicture?: string;
  fallbackName?: string;
  fallbackEmail?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  variant = 'default',
  fallbackPicture,
  fallbackName,
  fallbackEmail,
}) => {
  const { user, login, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasValidClientId = Boolean(googleClientId && googleClientId.trim());
  const hasFallback = Boolean(fallbackPicture || fallbackName || fallbackEmail);
  const displayUser =
    user ??
    (hasFallback
      ? {
          picture: fallbackPicture ?? 'https://i.pravatar.cc/150?u=telma-guest',
          name: fallbackName ?? 'Guest',
          email: fallbackEmail,
        }
      : null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!displayUser) {
    return null;
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      login(tokenResponse);
      setIsOpen(false);
    },
    onError: () => {
      console.log('Login Failed');
    },
    scope: 'https://www.googleapis.com/auth/drive.appdata',
  });

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="avatar-menu" ref={dropdownRef}>
      <button
        type="button"
        className={`avatar-trigger ${isOpen ? 'is-open' : ''} ${variant === 'compact' ? 'is-compact' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <img src={displayUser.picture} alt="User avatar" className="avatar-image" />
        {variant === 'default' && (
          <div className="avatar-text">
            <span className="avatar-name">{displayUser.name}</span>
            {displayUser.email && <span className="avatar-email">{displayUser.email}</span>}
          </div>
        )}
        <ChevronDown size={16} className="avatar-caret" />
      </button>

      {isOpen && (
        <div className="avatar-dropdown" role="menu">
          {!user && hasValidClientId && (
            <button
              type="button"
              className="avatar-menu-item"
              onClick={() => handleLogin()}
            >
              <LogIn size={18} />
              <span>Sign in with Google</span>
            </button>
          )}
          <button
            type="button"
            className="avatar-menu-item"
            onClick={() => handleNavigate('/dashboard')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            type="button"
            className="avatar-menu-item"
            onClick={() => handleNavigate('/favorites')}
          >
            <Star size={18} />
            <span>Favorites</span>
          </button>
          {user && (
            <button
              type="button"
              className="avatar-menu-item is-danger"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;
