import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ClientProfile from './ClientProfile';
import './ClientLayout.css';

interface ClientLayoutProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ currentPage, onPageChange }) => {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const renderPage = () => {
    return <ClientProfile currentPage={currentPage} />;
  };

  return (
    <div className="client-layout">
      {/* Secondary Navigation */}
      <div className="secondary-nav">
        <div className="secondary-nav-container">
          <button 
            className={`secondary-nav-item ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => onPageChange('profile')}
          >
            <span className="nav-icon">👤</span>
            Account
          </button>
          <button 
            className={`secondary-nav-item ${currentPage === 'bookings' ? 'active' : ''}`}
            onClick={() => onPageChange('bookings')}
          >
            <span className="nav-icon">📋</span>
            Bookings
          </button>
          <button 
            className={`secondary-nav-item ${currentPage === 'payments' ? 'active' : ''}`}
            onClick={() => onPageChange('payments')}
          >
            <span className="nav-icon">💳</span>
            Payments
          </button>
          <button 
            className={`secondary-nav-item ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onPageChange('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="client-main">
        {renderPage()}
      </main>
    </div>
  );
};

export default ClientLayout;
