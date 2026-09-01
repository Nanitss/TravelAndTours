import { PaymentService, BookingService } from './supabaseService';

// Webhook event types from PayMongo
export interface PayMongoWebhookEvent {
  id: string;
  type: string;
  data: {
    id: string;
    type: string;
    attributes: {
      type: string;
      livemode: boolean;
      data: {
        id: string;
        type: string;
        attributes: any;
      };
      created_at: string;
      updated_at: string;
    };
  };
}

// Webhook handler for PayMongo events
export class WebhookHandler {
  // Verify webhook signature (implement proper signature verification)
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // TODO: Implement proper HMAC signature verification
    // For now, return true for testing
    console.log('⚠️ Webhook signature verification not implemented - use in production!');
    return true;
  }

  // Handle payment intent events
  static async handlePaymentIntentEvent(event: PayMongoWebhookEvent): Promise<void> {
    try {
      const paymentIntentId = event.data.attributes.data.id;
      const eventType = event.data.attributes.type;
      
      console.log(`🔄 Processing webhook event: ${eventType} for payment intent: ${paymentIntentId}`);

      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(paymentIntentId);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(paymentIntentId);
          break;
        case 'payment_intent.cancelled':
          await this.handlePaymentCancellation(paymentIntentId);
          break;
        default:
          console.log(`ℹ️ Unhandled event type: ${eventType}`);
      }
    } catch (error) {
      console.error('❌ Error handling payment intent event:', error);
      throw error;
    }
  }

  // Handle successful payment
  static async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      console.log(`✅ Payment succeeded for intent: ${paymentIntentId}`);
      
      // Find booking by payment intent ID
      const bookings = await BookingService.getAllBookings();
      const booking = bookings.find(b => b.paymentIntentId === paymentIntentId);
      
      if (booking) {
        // Update booking status to confirmed
        await BookingService.updateBooking(booking.id!, {
          status: 'confirmed',
          paymentStatus: 'paid'
        });

        console.log(`✅ Booking ${booking.bookingId} confirmed after successful payment`);
      } else {
        console.warn(`⚠️ No booking found for payment intent: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('❌ Error handling payment success:', error);
      throw error;
    }
  }

  // Handle payment failure
  static async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    try {
      console.log(`❌ Payment failed for intent: ${paymentIntentId}`);
      
      // Find booking by payment intent ID
      const bookings = await BookingService.getAllBookings();
      const booking = bookings.find(b => b.paymentIntentId === paymentIntentId);
      
      if (booking) {
        // Update booking status to cancelled
        await BookingService.updateBooking(booking.id!, {
          status: 'cancelled',
          paymentStatus: 'failed'
        });

        console.log(`❌ Booking ${booking.bookingId} cancelled due to payment failure`);
      } else {
        console.warn(`⚠️ No booking found for payment intent: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('❌ Error handling payment failure:', error);
      throw error;
    }
  }

  // Handle payment cancellation
  static async handlePaymentCancellation(paymentIntentId: string): Promise<void> {
    try {
      console.log(`🚫 Payment cancelled for intent: ${paymentIntentId}`);
      
      // Find booking by payment intent ID
      const bookings = await BookingService.getAllBookings();
      const booking = bookings.find(b => b.paymentIntentId === paymentIntentId);
      
      if (booking) {
        // Update booking status to cancelled
        await BookingService.updateBooking(booking.id!, {
          status: 'cancelled',
          paymentStatus: 'failed'
        });

        console.log(`🚫 Booking ${booking.bookingId} cancelled`);
      } else {
        console.warn(`⚠️ No booking found for payment intent: ${paymentIntentId}`);
      }
    } catch (error) {
      console.error('❌ Error handling payment cancellation:', error);
      throw error;
    }
  }

  // Process webhook payload
  static async processWebhook(
    payload: string,
    signature: string,
    webhookSecret: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify webhook signature
      if (!this.verifyWebhookSignature(payload, signature, webhookSecret)) {
        return {
          success: false,
          message: 'Invalid webhook signature'
        };
      }

      // Parse webhook event
      const event: PayMongoWebhookEvent = JSON.parse(payload);
      
      // Handle the event based on type
      if (event.type === 'payment_intent') {
        await this.handlePaymentIntentEvent(event);
      } else {
        console.log(`ℹ️ Unhandled webhook type: ${event.type}`);
      }

      return {
        success: true,
        message: 'Webhook processed successfully'
      };
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed'
      };
    }
  }
}

// Express.js webhook endpoint example
export const createWebhookEndpoint = (webhookSecret: string) => {
  return async (req: any, res: any) => {
    try {
      const signature = req.headers['paymongo-signature'] || '';
      const payload = JSON.stringify(req.body);
      
      const result = await WebhookHandler.processWebhook(
        payload,
        signature,
        webhookSecret
      );
      
      if (result.success) {
        res.status(200).json({ message: 'Webhook processed successfully' });
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (error) {
      console.error('❌ Webhook endpoint error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Helper function to manually verify payment status
export const verifyPaymentStatus = async (paymentIntentId: string): Promise<{
  status: string;
  success: boolean;
  message: string;
}> => {
  try {
    const { PaymentService } = await import('./paymentService');
    const result = await PaymentService.verifyPayment(paymentIntentId);
    
    if (result.success) {
      // Trigger webhook handler for successful payment
      await WebhookHandler.handlePaymentSuccess(paymentIntentId);
    } else {
      // Trigger webhook handler for failed payment
      await WebhookHandler.handlePaymentFailure(paymentIntentId);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error verifying payment status:', error);
    return {
      status: 'failed',
      success: false,
      message: error instanceof Error ? error.message : 'Payment verification failed'
    };
  }
};
