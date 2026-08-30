import React, { useState } from 'react';
import './AdminSettings.css';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    darkMode: true,
    zoom: true,
    desktopNotifications: true,
    notificationSound: true,
    emailNotifications: false,
    smsNotifications: false,
    autoBackup: true,
    analytics: true
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <div className="header-actions">
          <button className="action-btn">
            <span>💾</span>
            Save Changes
          </button>
          <button className="action-btn">
            <span>🔄</span>
            Reset to Default
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Display Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Display</h3>
            <p>Customize your display preferences</p>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Dark Mode</h4>
                <p>Switch to dark theme for better viewing in low light</p>
              </div>
              <div className={`toggle-switch ${settings.darkMode ? 'active' : ''}`} onClick={() => handleToggle('darkMode')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Zoom</h4>
                <p>Enable zoom functionality for better accessibility</p>
              </div>
              <div className={`toggle-switch ${settings.zoom ? 'active' : ''}`} onClick={() => handleToggle('zoom')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Notifications</h3>
            <p>Manage your notification preferences</p>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Desktop Notifications</h4>
                <p>Receive notifications on your desktop</p>
              </div>
              <div className={`toggle-switch ${settings.desktopNotifications ? 'active' : ''}`} onClick={() => handleToggle('desktopNotifications')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Notification Sound</h4>
                <p>Play sound when notifications arrive</p>
              </div>
              <div className={`toggle-switch ${settings.notificationSound ? 'active' : ''}`} onClick={() => handleToggle('notificationSound')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
              <div className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`} onClick={() => handleToggle('emailNotifications')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>SMS Notifications</h4>
                <p>Receive notifications via SMS</p>
              </div>
              <div className={`toggle-switch ${settings.smsNotifications ? 'active' : ''}`} onClick={() => handleToggle('smsNotifications')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h3>System</h3>
            <p>Configure system-wide settings</p>
          </div>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Auto Backup</h4>
                <p>Automatically backup data daily</p>
              </div>
              <div className={`toggle-switch ${settings.autoBackup ? 'active' : ''}`} onClick={() => handleToggle('autoBackup')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h4>Analytics</h4>
                <p>Collect usage analytics to improve the platform</p>
              </div>
              <div className={`toggle-switch ${settings.analytics ? 'active' : ''}`} onClick={() => handleToggle('analytics')}>
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Account</h3>
            <p>Manage your account information</p>
          </div>
          <div className="account-info">
            <div className="info-item">
              <label>Full Name</label>
              <input type="text" defaultValue="Admin User" className="info-input" />
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <input type="email" defaultValue="admin@wanderly.com" className="info-input" />
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <input type="tel" defaultValue="+1 (555) 123-4567" className="info-input" />
            </div>
            <div className="info-item">
              <label>Role</label>
              <input type="text" defaultValue="Administrator" className="info-input" disabled />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h3>Security</h3>
            <p>Manage your security preferences</p>
          </div>
          <div className="security-actions">
            <button className="security-btn">
              <span>🔑</span>
              Change Password
            </button>
            <button className="security-btn">
              <span>🔐</span>
              Two-Factor Authentication
            </button>
            <button className="security-btn">
              <span>📱</span>
              Manage Devices
            </button>
            <button className="security-btn danger">
              <span>🚪</span>
              Sign Out All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
