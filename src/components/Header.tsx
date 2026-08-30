import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../utils/firebaseService';
import './Header.css';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onBookingClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  currentUser?: User | null;
  isAdmin?: boolean;
  isClient?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick, onBookingClick, onHomeClick, onProfileClick, currentUser, isAdmin, isClient }) => {
  const { logout } = useAuth();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <div className="logo-main">Wanderly</div>
          <div className="logo-subtitle">ITINERARY GENERATOR</div>
        </div>

        {/* Navigation */}
        <nav className="nav">
          {onHomeClick ? (
            <button className="nav-link active" onClick={onHomeClick}>Home</button>
          ) : (
            <a href="#home" className="nav-link active">Home</a>
          )}
          {currentUser && onBookingClick && (
            <button className="nav-link booking-link" onClick={onBookingClick}>
              Book Now
            </button>
          )}
          
          
        </nav>

        {/* Right side actions */}
        <div className="header-actions">
          {/* Language Selector */}
          <div className="language-selector">
            <button 
              className="language-btn"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <span className="globe-icon">🌐</span>
              <span>EN</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showLanguageDropdown && (
              <div className="language-dropdown">
                <div className="language-option">English</div>
                <div className="language-option">Spanish</div>
                <div className="language-option">French</div>
              </div>
            )}
          </div>

          {/* Auth Actions */}
          {currentUser ? (
            <div className="user-actions">
              <span className="welcome-text">Welcome, {currentUser.email}</span>
              {isClient && onProfileClick && (
                <button className="profile-btn" onClick={onProfileClick}>
                  My Profile
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-actions">
              <button className="login-link" onClick={onLoginClick}>Login</button>
              <button className="signup-btn" onClick={onSignupClick}>Sign Up</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
