import React, { useState } from 'react';
import { PaymentService, PaymentMethod, formatAmount, getPaymentMethodDisplayName, getPaymentMethodIcon } from '../utils/paymentService';
import { BookingService, ActivityService, PaymentService as FirebasePaymentService, SalesService } from '../utils/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import './PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    packageId: string;
    packageName: string;
    packagePrice: number;
    arrivalDate: string;
    departureDate: string;
    passengers: number;
  } | null;
  onPaymentSuccess: (bookingId: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess
}) => {
  const { currentUser } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('gcash');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'partial'>('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !bookingData || !currentUser) return null;

  const totalAmount = bookingData.packagePrice * bookingData.passengers;
  const serviceFee = Math.round(totalAmount * 0.1);
  const finalAmount = totalAmount + serviceFee;
  
  // Calculate payment amounts based on selected type
  const paymentAmount = selectedPaymentType === 'partial' ? Math.round(finalAmount * 0.5) : finalAmount;
  const remainingAmount = selectedPaymentType === 'partial' ? Math.round(finalAmount * 0.5) : 0;
  
  // Calculate due date (3 days before travel date)
  const calculateDueDate = (travelDate: string) => {
    const travel = new Date(travelDate);
    const dueDate = new Date(travel);
    dueDate.setDate(travel.getDate() - 3);
    return dueDate.toISOString().split('T')[0];
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setErrorMessage('');
  };

  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setSelectedPaymentType(type);
    setErrorMessage('');
  };

  const handlePayment = async () => {
    if (!currentUser) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      console.log('🔄 Starting payment process...');
      
      // Create PayMongo checkout session
      const paymentResult = await PaymentService.processPayment(
        paymentAmount,
        selectedPaymentMethod,
        {
          name: currentUser.name || currentUser.Username || '',
          email: currentUser.email || currentUser.Email || '',
          phone: currentUser.phone || ''
        },
        bookingData
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.message);
      }

      console.log('✅ Checkout session created successfully');
      console.log('🔗 Redirecting to PayMongo checkout...');

      // Store booking data in localStorage for after payment
      const bookingDataToStore = {
        packageId: bookingData.packageId,
        packageName: bookingData.packageName,
        packagePrice: bookingData.packagePrice,
        arrivalDate: bookingData.arrivalDate,
        departureDate: bookingData.departureDate,
        passengers: bookingData.passengers,
        totalAmount: finalAmount,
        paymentAmount: paymentAmount,
        remainingAmount: remainingAmount,
        paymentType: selectedPaymentType,
        paymentMethod: selectedPaymentMethod,
        userId: currentUser.id,
        customerName: currentUser.name || currentUser.Username || '',
        customerEmail: currentUser.email || currentUser.Email || '',
        sessionId: paymentResult.sessionId,
        dueDate: selectedPaymentType === 'partial' ? calculateDueDate(bookingData.departureDate) : undefined
      };

      localStorage.setItem('pendingBooking', JSON.stringify(bookingDataToStore));

      // Redirect to PayMongo checkout
      window.location.href = paymentResult.checkoutUrl;

    } catch (error) {
      console.error('❌ Payment processing failed:', error);
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

  return (
    <div className="payment-modal-overlay" onClick={handleClose}>
      <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <div className="payment-logo">
            <div className="logo-icon">💳</div>
            <div className="logo-text">Secure Payment</div>
          </div>
          <button className="close-btn" onClick={handleClose} disabled={isProcessing}>×</button>
        </div>

        <div className="payment-content-wrapper">
          <div className="payment-summary">
            <h3>Payment Summary</h3>
            <div className="booking-details">
              <div className="detail-row">
                <span>Package:</span>
                <span>{bookingData.packageName}</span>
              </div>
              <div className="detail-row">
                <span>Travel Date:</span>
                <span>{bookingData.arrivalDate} - {bookingData.departureDate}</span>
              </div>
              <div className="detail-row">
                <span>Participants:</span>
                <span>{bookingData.passengers} {bookingData.passengers === 1 ? 'Person' : 'People'}</span>
              </div>
            </div>

            <div className="amount-breakdown">
              <div className="amount-item">
                <span>Base Price</span>
                <span>{formatAmount(bookingData.packagePrice * bookingData.passengers)}</span>
              </div>
              <div className="amount-item">
                <span>Service Fee (10%)</span>
                <span>{formatAmount(serviceFee)}</span>
              </div>
              <div className="amount-item total">
                <span>Total Amount</span>
                <span>{formatAmount(finalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="payment-type-selection">
            <h3>Payment Options</h3>
            <div className="payment-type-options">
              <div 
                className={`payment-type-option ${selectedPaymentType === 'full' ? 'selected' : ''}`}
                onClick={() => handlePaymentTypeChange('full')}
              >
                <div className="payment-type-icon">💳</div>
                <div className="payment-type-info">
                  <div className="payment-type-name">Pay in Full</div>
                  <div className="payment-type-description">Pay the complete amount now</div>
                  <div className="payment-type-amount">{formatAmount(finalAmount)}</div>
                </div>
                <div className="payment-type-radio">
                  <input 
                    type="radio" 
                    name="paymentType" 
                    value="full"
                    checked={selectedPaymentType === 'full'}
                    onChange={() => handlePaymentTypeChange('full')}
                  />
                </div>
              </div>

              <div 
                className={`payment-type-option ${selectedPaymentType === 'partial' ? 'selected' : ''}`}
                onClick={() => handlePaymentTypeChange('partial')}
              >
                <div className="payment-type-icon">⏰</div>
                <div className="payment-type-info">
                  <div className="payment-type-name">Pay 50% Now</div>
                  <div className="payment-type-description">Pay 50% now, 50% by {calculateDueDate(bookingData.departureDate)}</div>
                  <div className="payment-type-amount">
                    <span>Now: {formatAmount(paymentAmount)}</span>
                    <span>Later: {formatAmount(remainingAmount)}</span>
                  </div>
                </div>
                <div className="payment-type-radio">
                  <input 
                    type="radio" 
                    name="paymentType" 
                    value="partial"
                    checked={selectedPaymentType === 'partial'}
                    onChange={() => handlePaymentTypeChange('partial')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="payment-options">
              <div 
                className={`payment-option ${selectedPaymentMethod === 'gcash' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('gcash')}
              >
                <div className="payment-icon">{getPaymentMethodIcon('gcash')}</div>
                <div className="payment-info">
                  <div className="payment-name">{getPaymentMethodDisplayName('gcash')}</div>
                  <div className="payment-description">Pay with your GCash wallet</div>
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
                  <div className="payment-name">{getPaymentMethodDisplayName('bank_transfer')}</div>
                  <div className="payment-description">Pay via online banking</div>
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
              <span className="error-icon">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              <span>Payment successful! Your booking is being confirmed...</span>
            </div>
          )}

          <div className="payment-actions">
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
                `Pay ${formatAmount(paymentAmount)}`
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

export default PaymentModal;
