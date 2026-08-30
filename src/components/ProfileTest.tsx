import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ClientLayout from './ClientLayout';

const ProfileTest: React.FC = () => {
  const { currentUser, isClient } = useAuth();

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Please log in to test the profile page</h2>
        <p>You need to be logged in as a client to access the profile page.</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Profile Page Test</h2>
        <p>You are logged in as: {currentUser.email}</p>
        <p>Role: {currentUser.role === 1 ? 'Client' : 'Admin'}</p>
        <p>This page is only accessible to clients.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '20px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h2>Profile Page Test</h2>
        <p>Testing the client profile page functionality.</p>
        <p>User: {currentUser.name || currentUser.Username || currentUser.email}</p>
        <p>Email: {currentUser.email || currentUser.Email}</p>
      </div>
      <ClientLayout currentPage="profile" onPageChange={() => {}} />
    </div>
  );
};

export default ProfileTest;
