import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import AdminDashboardPage from './AdminDashboard';
import AdminPackages from './AdminPackages';
import AdminBookings from './AdminBookings';
import AdminRatings from './AdminRatings';
import AdminSales from './AdminSales';
import AdminAnalytics from './AdminAnalytics';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

const AdminDashboardMain: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardPage />;
      case 'packages':
        return <AdminPackages />;
      case 'bookings':
        return <AdminBookings />;
      case 'ratings':
        return <AdminRatings />;
      case 'sales':
        return <AdminSales />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboardPage />;
    }
  };

  useEffect(() => {
    const handlePageChange = (event: CustomEvent) => {
      setCurrentPage(event.detail);
    };

    window.addEventListener('adminPageChange', handlePageChange as EventListener);
    
    return () => {
      window.removeEventListener('adminPageChange', handlePageChange as EventListener);
    };
  }, []);

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AdminLayout>
  );
};

export default AdminDashboardMain;
