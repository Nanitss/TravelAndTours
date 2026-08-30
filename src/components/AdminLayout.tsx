import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'packages', label: 'Packages', icon: '📦' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'ratings', label: 'Ratings', icon: '⭐' },
    { id: 'sales', label: 'Sales', icon: '💰' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="admin-layout">
      {/* Top Header Bar */}
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-image">🌍</div>
              <div className="logo-text">
                <div className="logo-main">Wanderly</div>
                <div className="logo-subtitle">YOUR JOURNEY COMPANION</div>
              </div>
            </div>
          </div>
          
          <div className="header-center">
            <div className="search-container">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input type="text" placeholder="Search" className="search-input" />
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-actions">
              <button className="action-btn">
                <span className="action-icon">📧</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">🔔</span>
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                <span className="logout-text">Logout</span>
              </button>
              <div className="user-section" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar">
                  <div className="avatar-img">👤</div>
                </div>
                <div className="user-details">
                  <div className="user-name">{currentUser?.name || 'Admin User'}</div>
                  <div className="user-email">{currentUser?.email || 'admin@wanderly.com'}</div>
                </div>
                <span className="dropdown-icon">▼</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="admin-navigation">
        <div className="nav-container">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="admin-content">
        {children}
      </main>

      {/* User Dropdown Menu */}
      {showUserMenu && (
        <div className="user-dropdown" ref={dropdownRef}>
          <div className="dropdown-content">
            <div className="dropdown-item" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              <span>Logout</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
