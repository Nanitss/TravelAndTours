import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PaymentService } from '../utils/paymentService';
import { BookingService, PaymentService as FirebasePaymentService, SalesService } from '../utils/supabaseService';
import './RemainingPaymentModal.css';

interface RemainingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    bookingId: string;
    tourTitle: string;
    totalPrice: number;
    amountPaid: number;
    amountRemaining: number;
    dueDate: string;
    paymentMethod: string;
    userId: string;
    customerName: string;
    customerEmail: string;
  };
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'gcash' | 'bank_transfer';

const RemainingPaymentModal: React.FC<RemainingPaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess
}) => {
  const { currentUser } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('gcash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !booking || !currentUser) return null;

  const formatAmount = (amount: number) => `₱${amount.toLocaleString()}`;

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'gcash': return '📱';
      case 'bank_transfer': return '🏦';
      default: return '💳';
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setErrorMessage('');
  };

  const handlePayment = async () => {
    if (!currentUser) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      console.log('🔄 Processing remaining payment...', {
        bookingId: booking.bookingId,
        amount: booking.amountRemaining,
        paymentMethod: selectedPaymentMethod
      });

      // Create PayMongo checkout session for remaining amount
      const paymentResult = await PaymentService.processPayment(
        booking.amountRemaining,
        selectedPaymentMethod,
        {
          name: currentUser.name || currentUser.Username || '',
          email: currentUser.email || currentUser.Email || '',
          phone: currentUser.phone || ''
        },
        {
          packageId: booking.id,
          packageName: booking.tourTitle,
          packagePrice: booking.totalPrice,
          arrivalDate: '', // Not needed for remaining payment
          departureDate: '', // Not needed for remaining payment
          passengers: 1 // Not needed for remaining payment
        }
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message);
      }

      console.log('✅ Checkout session created for remaining payment');
      console.log('🔗 Redirecting to PayMongo checkout...');

      // Store remaining payment data in localStorage
      const remainingPaymentData = {
        bookingId: booking.bookingId,
        amount: booking.amountRemaining,
        paymentMethod: selectedPaymentMethod,
        paymentType: 'remaining',
        userId: currentUser.id,
        customerName: currentUser.name || currentUser.Username || '',
        customerEmail: currentUser.email || currentUser.Email || '',
        sessionId: paymentResult.sessionId,
        isRemainingPayment: true
      };

      localStorage.setItem('remainingPayment', JSON.stringify(remainingPaymentData));

      // Redirect to PayMongo checkout
      window.location.href = paymentResult.checkoutUrl;

    } catch (error) {
      console.error('❌ Remaining payment processing failed:', error);
      setPaymentStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const isOverdue = new Date(booking.dueDate) < new Date();
  const daysUntilDue = Math.ceil((new Date(booking.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="remaining-payment-modal-overlay">
      <div className="remaining-payment-modal">
        <div className="modal-header">
          <h2>Pay Remaining Balance</h2>
          <button className="close-btn" onClick={handleClose} disabled={isProcessing}>
            ×
          </button>
        </div>

        <div className="modal-content-wrapper">
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Tour:</span>
              <span>{booking.tourTitle}</span>
            </div>
            <div className="summary-item">
              <span>Total Price:</span>
              <span>{formatAmount(booking.totalPrice)}</span>
            </div>
            <div className="summary-item">
              <span>Amount Paid:</span>
              <span className="paid-amount">{formatAmount(booking.amountPaid)}</span>
            </div>
            <div className="summary-item total-remaining">
              <span>Remaining Balance:</span>
              <span className="remaining-amount">{formatAmount(booking.amountRemaining)}</span>
            </div>
            <div className="summary-item">
              <span>Due Date:</span>
              <span className={isOverdue ? 'overdue' : ''}>
                {new Date(booking.dueDate).toLocaleDateString()}
                {isOverdue && ' (OVERDUE)'}
              </span>
            </div>
            {!isOverdue && (
              <div className="summary-item">
                <span>Days Remaining:</span>
                <span>{daysUntilDue} days</span>
              </div>
            )}
          </div>

          {isOverdue && (
            <div className="overdue-warning">
              <span className="warning-icon">⚠️</span>
              <span>This payment is overdue. Please pay immediately to avoid booking cancellation.</span>
            </div>
          )}

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="payment-options">
              <div 
                className={`payment-option ${selectedPaymentMethod === 'gcash' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('gcash')}
              >
                <div className="payment-icon">{getPaymentMethodIcon('gcash')}</div>
                <div className="payment-info">
                  <div className="payment-name">GCash</div>
                  <div className="payment-description">Pay with your GCash account</div>
                </div>
                <div className="payment-radio">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="gcash"
                    checked={selectedPaymentMethod === 'gcash'}
                    onChange={() => handlePaymentMethodChange('gcash')}
                  />
                </div>
              </div>

              <div 
                className={`payment-option ${selectedPaymentMethod === 'bank_transfer' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('bank_transfer')}
              >
                <div className="payment-icon">{getPaymentMethodIcon('bank_transfer')}</div>
                <div className="payment-info">
                  <div className="payment-name">Bank Transfer</div>
                  <div className="payment-description">Pay via bank transfer</div>
                </div>
                <div className="payment-radio">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="bank_transfer"
                    checked={selectedPaymentMethod === 'bank_transfer'}
                    onChange={() => handlePaymentMethodChange('bank_transfer')}
                  />
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="error-message">
              <span className="error-icon">❌</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="modal-actions">
            <button 
              className="cancel-btn" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button 
              className="pay-btn" 
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing Payment...
                </>
              ) : (
                `Pay ${formatAmount(booking.amountRemaining)}`
              )}
            </button>
          </div>

          <div className="security-notice">
            <span className="security-icon">🔒</span>
            <span>Your payment is secured by PayMongo. We never store your payment details.</span>
          </div>

          <div className="policy-warning">
            <span className="warning-icon">⚠️</span>
            <div className="warning-content">
              <div className="warning-title">Important Booking Policies</div>
              <div className="warning-text">
                • <strong>Rescheduling:</strong> Only one rescheduling allowed per booking
                <br />
                • <strong>Refunds & Cancellations:</strong> Contact host directly - 10% deduction applies
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemainingPaymentModal;
