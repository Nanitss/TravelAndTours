import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { initializeServices } from './utils/initializeServices';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SampleItineraries from './components/SampleItineraries';
import AuthModal from './components/AuthModal';
import BookingPage from './components/BookingPage';
import AdminDashboardMain from './components/AdminDashboardMain';
import ClientLayout from './components/ClientLayout';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import './App.css';

// Main App Content Component
const AppContent: React.FC = () => {
  const { currentUser, isAdmin, isClient } = useAuth();

  useEffect(() => {
    initializeServices();
  }, []);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({
    isOpen: false,
    mode: 'login'
  });

  const [showBookingPage, setShowBookingPage] = useState(false);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [clientCurrentPage, setClientCurrentPage] = useState('profile');
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  // Check for payment success/cancel URLs
  const currentPath = window.location.pathname;
  const isPaymentSuccess = currentPath === '/payment/success';
  const isPaymentCancel = currentPath === '/payment/cancel';

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: authModal.mode });
  };

  const handleBookingClick = () => {
    setShowBookingPage(true);
    setSelectedTourId(null);
  };

  const handlePackageBookNow = (tourId: string) => {
    setSelectedTourId(tourId);
    setShowBookingPage(true);
  };

  const handleHomeClick = () => {
    setShowBookingPage(false);
    setShowClientProfile(false);
  };


  const handleClientProfileClick = () => {
    setShowClientProfile(true);
    setShowBookingPage(false);
  };

  // Payment success/cancel routing (highest priority)
  if (isPaymentSuccess) {
    return <PaymentSuccess />;
  }

  if (isPaymentCancel) {
    return <PaymentCancel />;
  }

  // Role-based routing
  if (currentUser && isAdmin) {
    return <AdminDashboardMain />;
  }

  if (currentUser && isClient && showClientProfile) {
    return (
      <div className="App">
        <Header 
          onLoginClick={() => openAuthModal('login')} 
          onSignupClick={() => openAuthModal('signup')}
          onBookingClick={handleBookingClick}
          onHomeClick={handleHomeClick}
          onProfileClick={handleClientProfileClick}
          currentUser={currentUser}
          isAdmin={isAdmin}
          isClient={isClient}
        />
        <ClientLayout currentPage={clientCurrentPage} onPageChange={setClientCurrentPage} />
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        onLoginClick={() => openAuthModal('login')} 
        onSignupClick={() => openAuthModal('signup')}
        onBookingClick={handleBookingClick}
        onHomeClick={handleHomeClick}
        onProfileClick={handleClientProfileClick}
        currentUser={currentUser}
        isAdmin={isAdmin}
        isClient={isClient}
      />
        {showBookingPage ? (
          <BookingPage selectedTourId={selectedTourId} />
        ) : (
          <>
            <HeroSection onBookNow={handlePackageBookNow} />
            <SampleItineraries />
          </>
        )}
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
