import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../utils/supabaseService';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode }) => {
  const [isLoginMode, setIsLoginMode] = useState(mode === 'login');

  // Update mode when prop changes
  React.useEffect(() => {
    setIsLoginMode(mode === 'login');
  }, [mode]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, signup } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (isLoginMode) {
        result = await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await signup(formData.email, formData.password, formData.username, UserRole.CLIENT);
      }

      if (result.success) {
        setSuccess(result.message);
        // Close modal immediately after successful login
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className="auth-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/assets/bali%2C%20indonesia.jpg') center/cover no-repeat`
        }}
      >
        {/* Left Panel - Informational */}
        <div className="modal-left-panel">
          <div className="left-panel-content">
            <h2 className="left-panel-title">Plan Your Next Adventure in Seconds</h2>
            <p className="left-panel-description">
              Log in to Wanderly and let AI craft personalized travel itineraries just for you. 
              From hidden gems to must-see attractions, your perfect trip starts here.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="modal-right-panel">
          <div className="modal-header">
            <div className="modal-logo">
              <div className="logo-main">Wanderly</div>
              <div className="logo-subtitle">ITINERARY GENERATOR</div>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="form-input"
                required={!isLoginMode}
              />
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="form-input"
              required
            />
          </div>

          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="form-input"
              required
            />
            <span className="password-toggle">👁️</span>
          </div>

          {!isLoginMode && (
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                className="form-input"
                required={!isLoginMode}
              />
              <span className="password-toggle">👁️</span>
            </div>
          )}


          {isLoginMode && (
            <div className="forgot-password">
              <a href="#forgot" className="forgot-link">Forgot your password?</a>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="social-auth">
            <p className="social-text">Or {isLoginMode ? 'sign in' : 'sign up'} with</p>
            <div className="social-buttons">
              <button type="button" className="social-btn">G</button>
              <button type="button" className="social-btn">f</button>
              <button type="button" className="social-btn">🍎</button>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLoginMode ? 'Login' : 'Sign Up')}
          </button>

          <div className="auth-switch">
            <p>
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="switch-btn"
                onClick={toggleMode}
              >
                {isLoginMode ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
