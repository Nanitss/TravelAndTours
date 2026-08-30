import React from 'react';
import './PaymentCancel.css';

const PaymentCancel: React.FC = () => {

  const handleTryAgain = () => {
    // Clear any pending booking data
    localStorage.removeItem('pendingBooking');
    window.location.href = '/booking';
  };

  const handleReturnHome = () => {
    // Clear any pending booking data
    localStorage.removeItem('pendingBooking');
    window.location.href = '/';
  };

  return (
    <div className="payment-cancel-container">
      <div className="cancel-content">
        <div className="cancel-icon">❌</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made to your account.</p>
        
        <div className="cancel-details">
          <h3>What happened?</h3>
          <ul>
            <li>You cancelled the payment process</li>
            <li>Your session may have expired</li>
            <li>There was an issue with the payment gateway</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="secondary-btn" onClick={handleReturnHome}>
            Return Home
          </button>
          <button className="primary-btn" onClick={handleTryAgain}>
            Try Again
          </button>
        </div>

        <div className="help-message">
          <p>Need help? Contact our support team if you're experiencing issues with payments.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
