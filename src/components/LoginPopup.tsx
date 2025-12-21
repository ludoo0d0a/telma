
import React from 'react';
import LoginButton from './LoginButton';

interface LoginPopupProps {
  onClose: () => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Connexion</p>
          <button className="delete is-close-button" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <p>Pour une expérience personnalisée, connectez-vous avec votre compte Google.</p>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <LoginButton />
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPopup;
