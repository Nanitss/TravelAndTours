import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CustomAuthService } from '../utils/customAuth';
import { createSampleData } from '../utils/createSampleData';

const TestAuth: React.FC = () => {
  const { login, currentUser, logout } = useAuth();
  const [testEmail, setTestEmail] = useState('Admin@gmail.com');
  const [testPassword, setTestPassword] = useState('Admin123');
  const [message, setMessage] = useState('');

  const handleCreateSampleData = async () => {
    try {
      setMessage('Creating sample data...');
      const result = await createSampleData();
      if (result.success) {
        setMessage('✅ Sample data created successfully! Check console for details.');
      } else {
        setMessage('❌ Error creating sample data');
      }
    } catch (error) {
      setMessage('❌ Error creating sample data');
    }
  };

  const handleTestLogin = async () => {
    try {
      setMessage('Testing login...');
      const result = await login(testEmail, testPassword);
      if (result.success) {
        setMessage('✅ Login successful!');
      } else {
        setMessage(`❌ Login failed: ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Login error');
    }
  };

  const handleLogout = () => {
    logout();
    setMessage('Logged out');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🔧 Authentication Test Panel</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>1. Create Sample Data</h3>
        <button 
          onClick={handleCreateSampleData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#20b2aa',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Create Sample Accounts
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>2. Test Login</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input 
            type="email" 
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input 
            type="password" 
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </div>
        <button 
          onClick={handleTestLogin}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Login
        </button>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>3. Current Status</h3>
        <p><strong>Logged in:</strong> {currentUser ? 'Yes' : 'No'}</p>
        {currentUser && (
          <>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role === 2 ? 'Admin' : 'Client'}</p>
          </>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>4. Sample Accounts (Firestore Users Table)</h3>
        <p><strong>Admin:</strong> Admin@gmail.com / Admin123 (Role 2)</p>
        <p><strong>Client:</strong> client@example.com / Client123 (Role 1)</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
          <strong>Note:</strong> These accounts are stored in the Firestore 'users' collection.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '10px',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: '1px solid',
          borderColor: message.includes('✅') ? '#c3e6cb' : '#f5c6cb',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default TestAuth;
