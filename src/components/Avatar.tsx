import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Avatar: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="avatar-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img src={user.picture} alt="User avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
      <div className="user-info">
        <span>{user.name}</span>
        <button onClick={logout} style={{ marginLeft: '10px', cursor: 'pointer' }}>Logout</button>
      </div>
    </div>
  );
};

export default Avatar;
