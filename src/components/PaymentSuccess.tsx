import React, { useEffect, useState } from 'react';
import { BookingService, ActivityService, PaymentService as FirebasePaymentService, SalesService, DateAvailabilityService } from '../utils/firebaseService';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [bookingId, setBookingId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const processRemainingPayment = async (remainingPaymentData: any, sessionId: string) => {
    try {
      console.log('🔄 Processing remaining payment for booking:', remainingPaymentData.bookingId);

      // Create payment record for remaining amount
      const paymentId = await FirebasePaymentService.createPayment({
        paymentIntentId: sessionId,
        bookingId: remainingPaymentData.bookingId,
        amount: remainingPaymentData.amount,
        currency: 'PHP',
        paymentMethod: remainingPaymentData.paymentMethod,
        status: 'succeeded',
        customerEmail: remainingPaymentData.customerEmail,
        customerName: remainingPaymentData.customerName,
        transactionId: sessionId,
        processedAt: new Date().toISOString(),
        // New fields for partial payment system
        paymentType: 'remaining',
        paymentNumber: 2,
        isPartialPayment: true,
        originalAmount: remainingPaymentData.amount,
        amountPaid: remainingPaymentData.amount,
        amountRemaining: 0,
        totalPaid: remainingPaymentData.amount,
        dueDate: '',
        isOverdue: false,
        daysUntilDue: 0,
        paymentStatus: 'succeeded',
        isVoided: false,
        voidReason: '',
        voidDate: '',
        refundRequested: false,
        refundAmount: 0,
        refundReason: '',
        refundStatus: 'pending',
        refundDate: '',
        adminNotes: '',
        processedBy: '',
        commission: 0,
        netAmount: remainingPaymentData.amount
      });

      console.log('✅ Remaining payment record created with ID:', paymentId);

      // Update the existing booking to mark as fully paid
      const existingBookings = await BookingService.getBookingsByUser(remainingPaymentData.userId);
      const bookingToUpdate = existingBookings.find(b => b.bookingId === remainingPaymentData.bookingId);
      
      if (bookingToUpdate) {
        await BookingService.updateBooking(bookingToUpdate.id!, {
          paymentStatus: 'paid',
          amountPaid: bookingToUpdate.totalPrice,
          amountRemaining: 0,
          paymentDate: new Date().toISOString(),
          status: 'confirmed'
        });

        console.log('✅ Booking updated to fully paid status');

        // Update the existing sales record instead of creating a new one
        const salesRecords = await SalesService.getAllSalesRecords();
        const salesRecordToUpdate = salesRecords.find(s => s.bookingId === remainingPaymentData.bookingId);
        
        if (salesRecordToUpdate) {
          await SalesService.updateSalesRecord(salesRecordToUpdate.id!, {
            amount: bookingToUpdate.totalPrice,
            netAmount: bookingToUpdate.totalPrice,
            paymentStatus: 'paid',
            paymentDate: new Date().toISOString()
          });

          console.log('✅ Sales record updated with full amount');
        }
      }

      // Clear remaining payment data
      localStorage.removeItem('remainingPayment');

      console.log('✅ Remaining payment processed successfully');
      setBookingId(remainingPaymentData.bookingId);
      setIsProcessing(false);

    } catch (error) {
      console.error('❌ Error processing remaining payment:', error);
      setError(error instanceof Error ? error.message : 'Error processing remaining payment');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Get session ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Check if this is a remaining payment
        const remainingPaymentData = localStorage.getItem('remainingPayment');
        if (remainingPaymentData) {
          console.log('🔄 Processing remaining payment...');
          await processRemainingPayment(JSON.parse(remainingPaymentData), sessionId);
          return;
        }

        // Get booking data from localStorage
        const pendingBookingData = localStorage.getItem('pendingBooking');
        if (!pendingBookingData) {
          throw new Error('No pending booking data found');
        }

        const bookingData = JSON.parse(pendingBookingData);
        console.log('🔄 Processing successful payment...', bookingData);

        // Generate unique booking ID
        const newBookingId = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        setBookingId(newBookingId);

        // Create booking record with payment information
        console.log('🔄 Creating booking record...', {
          bookingId: newBookingId,
          userId: bookingData.userId,
          tourId: bookingData.packageId,
          tourTitle: bookingData.packageName,
          participants: bookingData.passengers,
          totalPrice: bookingData.totalAmount,
          paymentType: bookingData.paymentType || 'full',
          amountPaid: bookingData.paymentAmount || bookingData.totalAmount,
          amountRemaining: bookingData.remainingAmount || 0
        });

        const bookingId = await BookingService.createBooking({
          bookingId: newBookingId,
          userId: bookingData.userId,
          tourId: bookingData.packageId,
          tourTitle: bookingData.packageName,
          participants: bookingData.passengers,
          totalPrice: bookingData.totalAmount,
          status: 'confirmed', // Set to confirmed since payment succeeded
          bookingDate: new Date().toISOString().split('T')[0],
          travelDate: bookingData.arrivalDate,
          departureDate: bookingData.departureDate,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          hasRescheduled: false,
          // Payment related fields
          paymentType: bookingData.paymentType || 'full',
          paymentStatus: 'paid',
          paymentMethod: bookingData.paymentMethod,
          paymentIntentId: sessionId,
          transactionId: sessionId,
          // Payment amounts
          amountPaid: bookingData.paymentAmount || bookingData.totalAmount,
          amountRemaining: bookingData.remainingAmount || 0,
          dueDate: bookingData.dueDate || '',
          paymentDate: new Date().toISOString(),
          // Booking management
          isVoided: false,
          voidReason: '',
          voidDate: '',
          rebookCount: 0
        });

        console.log('✅ Booking created successfully with ID:', bookingId);

        // Book the dates to prevent double booking
        console.log('🔄 Booking dates to prevent double booking...');
        try {
          // Book arrival date
          await DateAvailabilityService.bookDate(
            bookingData.packageId,
            bookingData.arrivalDate,
            newBookingId,
            bookingData.userId
          );
          console.log('✅ Arrival date booked:', bookingData.arrivalDate);

          // Book departure date if different from arrival
          if (bookingData.departureDate !== bookingData.arrivalDate) {
            await DateAvailabilityService.bookDate(
              bookingData.packageId,
              bookingData.departureDate,
              newBookingId,
              bookingData.userId
            );
            console.log('✅ Departure date booked:', bookingData.departureDate);
          }
        } catch (dateError) {
          console.error('❌ Error booking dates:', dateError);
          // Continue with payment processing even if date booking fails
        }

        // Create payment record with all required fields
        console.log('🔄 Creating payment record...');
        const paymentId = await FirebasePaymentService.createPayment({
          paymentIntentId: sessionId,
          bookingId: newBookingId,
          amount: bookingData.totalAmount,
          currency: 'PHP',
          paymentMethod: bookingData.paymentMethod,
          status: 'succeeded',
          customerEmail: bookingData.customerEmail,
          customerName: bookingData.customerName,
          transactionId: sessionId,
          processedAt: new Date().toISOString(),
          // New fields for partial payment system
          paymentType: bookingData.paymentType || 'full',
          paymentNumber: 1,
          isPartialPayment: bookingData.paymentType === 'partial',
          originalAmount: bookingData.totalAmount,
          amountPaid: bookingData.paymentAmount || bookingData.totalAmount,
          amountRemaining: bookingData.remainingAmount || 0,
          totalPaid: bookingData.paymentAmount || bookingData.totalAmount,
          dueDate: bookingData.dueDate || '',
          isOverdue: false,
          daysUntilDue: bookingData.dueDate ? Math.ceil((new Date(bookingData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
          paymentStatus: 'succeeded',
          isVoided: false,
          voidReason: '',
          voidDate: '',
          refundRequested: false,
          refundAmount: 0,
          refundReason: '',
          refundStatus: 'pending',
          refundDate: '',
          adminNotes: '',
          processedBy: '',
          commission: 0,
          netAmount: bookingData.paymentAmount || bookingData.totalAmount
        });

        console.log('✅ Payment record created successfully with ID:', paymentId);

        // Create sales record for analytics
        console.log('🔄 Creating sales record...');
        const salesId = await SalesService.createSalesRecord({
          bookingId: newBookingId,
          tourId: bookingData.packageId,
          tourTitle: bookingData.packageName,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          amount: bookingData.totalAmount,
          currency: 'PHP',
          paymentMethod: bookingData.paymentMethod,
          paymentStatus: 'paid',
          bookingDate: new Date().toISOString().split('T')[0],
          paymentDate: new Date().toISOString(),
          netAmount: bookingData.totalAmount
        });

        console.log('✅ Sales record created successfully with ID:', salesId);

        // Create activity record
        console.log('🔄 Creating activity record...');
        const activityId = await ActivityService.createActivity({
          type: 'booking',
          title: 'New Booking with Payment',
          description: `New booking for ${bookingData.packageName} by ${bookingData.customerName} - Payment: ${bookingData.paymentMethod}`,
          timestamp: new Date(),
          userId: bookingData.userId,
          relatedId: newBookingId
        });

        console.log('✅ Activity record created successfully with ID:', activityId);

        // Clear pending booking data
        localStorage.removeItem('pendingBooking');

        console.log('✅ Booking created successfully with payment');
        setIsProcessing(false);

      } catch (error) {
        console.error('❌ Error processing payment success:', error);
        setError(error instanceof Error ? error.message : 'Error processing payment');
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, []);

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  const handleViewBooking = () => {
    window.location.href = '/profile';
  };

  if (isProcessing) {
    return (
      <div className="payment-success-container">
        <div className="processing-content">
          <div className="spinner"></div>
          <h2>Processing Your Payment...</h2>
          <p>Please wait while we confirm your booking.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-success-container">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Payment Processing Error</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p>Your booking has been confirmed and payment processed successfully.</p>
        
        <div className="booking-details">
          <h3>Booking Details</h3>
          <div className="detail-item">
            <span>Booking ID:</span>
            <span className="booking-id">{bookingId}</span>
          </div>
          <div className="detail-item">
            <span>Status:</span>
            <span className="status-confirmed">Confirmed</span>
          </div>
        </div>

        <div className="action-buttons">
          <button className="secondary-btn" onClick={handleReturnHome}>
            Return Home
          </button>
          <button className="primary-btn" onClick={handleViewBooking}>
            View My Bookings
          </button>
        </div>

        <div className="success-message">
          <p>You will receive a confirmation email shortly with all the details of your booking.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
