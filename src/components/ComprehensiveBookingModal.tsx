import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ComprehensiveBookingModal.css';

interface BookingData {
  packageId: string;
  packageName: string;
  packagePrice: number;
  packageImage?: string;
  packageDescription?: string;
  packageHighlights?: string[];
  packageIncluded?: string[];
  packageItinerary?: string[];
  packageDuration?: number;
  packageDestination?: string;
  arrivalDate: string;
  departureDate: string;
  passengers: number;
}

interface ComprehensiveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingData | null;
}

const ComprehensiveBookingModal: React.FC<ComprehensiveBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  bookingData 
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'gcash' | 'bank_transfer'>('gcash');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'full' | 'partial'>('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { currentUser } = useAuth();

  if (!isOpen || !bookingData) return null;

  const finalAmount = bookingData.packagePrice + Math.round(bookingData.packagePrice * 0.1);
  const paymentAmount = selectedPaymentType === 'partial' ? Math.round(finalAmount * 0.5) : finalAmount;
  const remainingAmount = finalAmount - paymentAmount;

  const calculateDueDate = (departureDate: string) => {
    const date = new Date(departureDate);
    date.setDate(date.getDate() - 3);
    return date.toISOString().split('T')[0];
  };

  const handlePaymentTypeChange = (type: 'full' | 'partial') => {
    setSelectedPaymentType(type);
    setErrorMessage('');
  };

  const handlePaymentMethodChange = (method: 'gcash' | 'bank_transfer') => {
    setSelectedPaymentMethod(method);
    setErrorMessage('');
  };

  const handleProceedToPayment = async () => {
    if (!currentUser) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      console.log('🔄 Starting payment process...');
      
      // Import PaymentService dynamically to avoid circular imports
      const { PaymentService } = await import('../utils/paymentService');
      
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
        packageImage: bookingData.packageImage,
        packageDescription: bookingData.packageDescription,
        packageHighlights: bookingData.packageHighlights,
        packageIncluded: bookingData.packageIncluded,
        packageItinerary: bookingData.packageItinerary,
        packageDuration: bookingData.packageDuration,
        packageDestination: bookingData.packageDestination,
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
      setErrorMessage(error instanceof Error ? error.message : 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="comprehensive-modal-overlay" onClick={onClose}>
      <div className="comprehensive-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="logo">
            <div className="logo-icon">✈️</div>
            <div className="logo-text">Wanderly</div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="comprehensive-content">
          <div className="left-section">
            {/* Package Details */}
            <div className="package-section">
              <div className="package-image">
                <img src={bookingData.packageImage || '/assets/tokyo%2C%20japan.jpg'} 
                     alt={bookingData.packageName} />
              </div>
              <div className="package-info">
                <h2>{bookingData.packageName}</h2>
                <p className="destination">📍 {bookingData.packageDestination}</p>
                <p className="duration">⏱️ {bookingData.packageDuration} Days</p>
                <p className="description">{bookingData.packageDescription}</p>
              </div>
            </div>

            {/* Trip Highlights */}
            {bookingData.packageHighlights && bookingData.packageHighlights.length > 0 && (
              <div className="highlights-section">
                <h3>🌟 Trip Highlights</h3>
                <ul>
                  {bookingData.packageHighlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* What's Included */}
            {bookingData.packageIncluded && bookingData.packageIncluded.length > 0 && (
              <div className="included-section">
                <h3>✅ What's Included</h3>
                <ul>
                  {bookingData.packageIncluded.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itinerary */}
            {bookingData.packageItinerary && bookingData.packageItinerary.length > 0 && (
              <div className="itinerary-section">
                <h3>📅 Daily Itinerary</h3>
                <ol>
                  {bookingData.packageItinerary.map((day, index) => (
                    <li key={index}>{day}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="right-section">
            {/* Booking Summary */}
            <div className="booking-summary">
              <h3>📋 Booking Summary</h3>
              <div className="summary-item">
                <span>Package:</span>
                <span>{bookingData.packageName}</span>
              </div>
              <div className="summary-item">
                <span>Check In:</span>
                <span>{bookingData.arrivalDate}</span>
              </div>
              <div className="summary-item">
                <span>Check Out:</span>
                <span>{bookingData.departureDate}</span>
              </div>
              <div className="summary-item">
                <span>Guests:</span>
                <span>{bookingData.passengers} {bookingData.passengers === 1 ? 'Guest' : 'Guests'}</span>
              </div>
              <div className="summary-item">
                <span>Duration:</span>
                <span>{bookingData.packageDuration} Days</span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="payment-section">
              <h3>💳 Payment Options</h3>
              
              <div className="payment-type-selection">
                <div className="payment-type-options">
                  <div 
                    className={`payment-type-option ${selectedPaymentType === 'full' ? 'selected' : ''}`}
                    onClick={() => handlePaymentTypeChange('full')}
                  >
                    <div className="payment-type-icon">💳</div>
                    <div className="payment-type-info">
                      <div className="payment-type-name">Pay in Full</div>
                      <div className="payment-type-description">Pay the complete amount now</div>
                      <div className="payment-type-amount">₱{finalAmount.toLocaleString()}</div>
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
                        <span>Now: ₱{paymentAmount.toLocaleString()}</span>
                        <span>Later: ₱{remainingAmount.toLocaleString()}</span>
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
                <h4>Select Payment Method</h4>
                <div className="payment-options">
                  <div 
                    className={`payment-option ${selectedPaymentMethod === 'gcash' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodChange('gcash')}
                  >
                    <div className="payment-icon">💳</div>
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
                    <div className="payment-icon">🏦</div>
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
            </div>

            {/* Price Breakdown */}
            <div className="price-section">
              <h3>💰 Price Breakdown</h3>
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Base price</span>
                  <span>₱{bookingData.packagePrice.toLocaleString()}</span>
                </div>
                <div className="price-item">
                  <span>Service fee</span>
                  <span>+₱{Math.round(bookingData.packagePrice * 0.1).toLocaleString()}</span>
                </div>
                <div className="price-item total-line">
                  <span>Total amount</span>
                  <span>₱{finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="final-amount">
                <div className="amount-item">
                  <span>Booking amount</span>
                  <span className="final-price">₱{finalAmount.toLocaleString()}</span>
                </div>
                <div className="amount-item">
                  <span>Payable now</span>
                  <span>₱0</span>
                </div>
                <div className="amount-item">
                  <span>Payable at departure</span>
                  <span>₱{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="cancel-btn" 
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="confirm-booking-btn" 
                onClick={handleProceedToPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₱${paymentAmount.toLocaleString()}`
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="security-notice">
              <span className="security-icon">🔒</span>
              <span>Your payment is secured by PayMongo. We never store your payment details.</span>
            </div>

            {/* Policy Warning */}
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
    </div>
  );
};

export default ComprehensiveBookingModal;
