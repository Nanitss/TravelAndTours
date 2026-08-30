import { Booking } from './firebaseService';

// PayMongo API Configuration
const PAYMONGO_CONFIG = {
  baseUrl: 'https://api.paymongo.com/v1',
  publicKey: process.env.REACT_APP_PAYMONGO_PUBLIC_KEY || '',
  secretKey: process.env.REACT_APP_PAYMONGO_SECRET_KEY || '',
  testMode: false // Disable test mode for redirection flow
};

// Payment Method Types
export type PaymentMethod = 'gcash' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';

// Payment Intent Interface
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  payment_method_allowed: string[];
  status: PaymentStatus;
  client_key: string;
  created_at: string;
  updated_at: string;
}

// Payment Method Interface
export interface PaymentMethodData {
  id: string;
  type: string;
  billing: {
    name: string;
    email: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
}

// Payment Interface
export interface Payment {
  id?: string;
  paymentIntentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymongoPaymentId?: string;
  customerEmail: string;
  customerName: string;
  createdAt?: any;
  updatedAt?: any;
}

// Payment Service Class
export class PaymentService {
  // Create Payment Intent
  static async createPaymentIntent(
    amount: number,
    currency: string = 'PHP',
    paymentMethod: PaymentMethod
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${PAYMONGO_CONFIG.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amount * 100, // Convert to centavos
              currency: currency,
              payment_method_allowed: [paymentMethod],
              description: `Travel booking payment - ${currency} ${amount}`,
              // Add return URL for GCash and bank transfer payments
              ...((paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') && {
                return_url: `${window.location.origin}/payment/success`,
                cancel_url: `${window.location.origin}/payment/cancel`
              })
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment intent creation failed: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Attach Payment Method to Intent
  static async attachPaymentMethod(
    paymentIntentId: string,
    paymentMethodId: string,
    paymentMethod: PaymentMethod
  ): Promise<Payment> {
    try {
      const requestBody: any = {
        data: {
          attributes: {
            payment_method: paymentMethodId
          }
        }
      };

      // Add return URL for GCash and bank transfer payments
      if (paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') {
        requestBody.data.attributes.return_url = `${window.location.origin}/payment/success`;
        requestBody.data.attributes.cancel_url = `${window.location.origin}/payment/cancel`;
      }

      const response = await fetch(`${PAYMONGO_CONFIG.baseUrl}/payment_intents/${paymentIntentId}/attach`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PayMongo API Error:', errorData);
        
        // In test mode, simulate successful payment for development
        if (PAYMONGO_CONFIG.testMode) {
          console.log('🧪 Test mode: Simulating successful payment attachment');
          return {
            id: `test_payment_${Date.now()}`,
            type: 'payment',
            attributes: {
              status: 'succeeded',
              amount: 0,
              currency: 'PHP',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          } as any;
        }
        
        throw new Error(`Payment method attachment failed: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  }

  // Get Payment Intent Status
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${PAYMONGO_CONFIG.baseUrl}/payment_intents/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get payment status: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Create Payment Method
  static async createPaymentMethod(
    type: PaymentMethod,
    billing: {
      name: string;
      email: string;
      phone: string;
    }
  ): Promise<PaymentMethodData> {
    try {
      const response = await fetch(`${PAYMONGO_CONFIG.baseUrl}/payment_methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: type,
              billing: billing
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment method creation failed: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  // Create Checkout Session (PayMongo Redirection Flow)
  static async createCheckoutSession(
    amount: number,
    paymentMethod: PaymentMethod,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    },
    bookingData: {
      packageId: string;
      packageName: string;
      packagePrice: number;
      arrivalDate: string;
      departureDate: string;
      passengers: number;
    }
  ): Promise<{
    checkoutUrl: string;
    sessionId: string;
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🔄 Creating PayMongo checkout session...');
      
      // Validate inputs
      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      if (!customerInfo.name || !customerInfo.email) {
        throw new Error('Customer information is required');
      }

      // Create checkout session
      const response = await fetch(`${PAYMONGO_CONFIG.baseUrl}/checkout_sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAYMONGO_CONFIG.secretKey + ':')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              line_items: [
                {
                  name: `${bookingData.packageName} - ${bookingData.passengers} ${bookingData.passengers === 1 ? 'Person' : 'People'}`,
                  description: `Travel booking for ${bookingData.packageName} from ${bookingData.arrivalDate} to ${bookingData.departureDate}`,
                  amount: amount * 100, // Convert to centavos
                  currency: 'PHP',
                  quantity: 1
                }
              ],
              payment_method_types: [paymentMethod],
              success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
              cancel_url: `${window.location.origin}/payment/cancel`,
              billing: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone
              }
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Checkout session creation failed: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      const checkoutUrl = data.data.attributes.checkout_url;
      const sessionId = data.data.id;

      console.log('✅ Checkout session created:', sessionId);
      console.log('🔗 Checkout URL:', checkoutUrl);

      return {
        checkoutUrl,
        sessionId,
        success: true,
        message: 'Checkout session created successfully'
      };
    } catch (error) {
      console.error('❌ Checkout session creation failed:', error);
      
      let errorMessage = 'Unable to create checkout session';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid payment amount')) {
          errorMessage = 'Please enter a valid payment amount';
        } else if (error.message.includes('Customer information is required')) {
          errorMessage = 'Please provide complete customer information';
        } else if (error.message.includes('Checkout session creation failed')) {
          errorMessage = 'Unable to create payment session. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        checkoutUrl: '',
        sessionId: '',
        success: false,
        message: errorMessage
      };
    }
  }

  // Process Payment (Redirection Flow)
  static async processPayment(
    amount: number,
    paymentMethod: PaymentMethod,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    },
    bookingData: {
      packageId: string;
      packageName: string;
      packagePrice: number;
      arrivalDate: string;
      departureDate: string;
      passengers: number;
    }
  ): Promise<{
    checkoutUrl: string;
    sessionId: string;
    success: boolean;
    message: string;
  }> {
    return this.createCheckoutSession(amount, paymentMethod, customerInfo, bookingData);
  }

  // Verify Payment Status
  static async verifyPayment(paymentIntentId: string): Promise<{
    status: PaymentStatus;
    success: boolean;
    message: string;
  }> {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      // In test mode, simulate successful payment
      if (PAYMONGO_CONFIG.testMode) {
        console.log('🧪 Test mode: Simulating successful payment verification');
        return {
          status: 'succeeded',
          success: true,
          message: 'Payment verified successfully (test mode)'
        };
      }

      const paymentIntent = await this.getPaymentIntentStatus(paymentIntentId);
      
      let message = '';
      switch (paymentIntent.status) {
        case 'succeeded':
          message = 'Payment verified successfully';
          break;
        case 'processing':
          message = 'Payment is being processed. Please wait...';
          break;
        case 'pending':
          message = 'Payment is pending. Please complete the payment.';
          break;
        case 'failed':
          message = 'Payment failed. Please try again.';
          break;
        case 'cancelled':
          message = 'Payment was cancelled.';
          break;
        default:
          message = `Payment status: ${paymentIntent.status}`;
      }
      
      return {
        status: paymentIntent.status,
        success: paymentIntent.status === 'succeeded',
        message
      };
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      // In test mode, return success even if verification fails
      if (PAYMONGO_CONFIG.testMode) {
        console.log('🧪 Test mode: Payment verification failed, but proceeding anyway');
        return {
          status: 'succeeded' as PaymentStatus,
          success: true,
          message: 'Payment verified successfully (test mode fallback)'
        };
      }
      
      let errorMessage = 'Payment verification failed';
      if (error instanceof Error) {
        if (error.message.includes('Payment intent ID is required')) {
          errorMessage = 'Invalid payment reference';
        } else if (error.message.includes('Failed to get payment status')) {
          errorMessage = 'Unable to verify payment status. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        status: 'failed',
        success: false,
        message: errorMessage
      };
    }
  }
}

// Helper function to format amount for display
export const formatAmount = (amount: number, currency: string = 'PHP'): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to get payment method display name
export const getPaymentMethodDisplayName = (method: PaymentMethod): string => {
  switch (method) {
    case 'gcash':
      return 'GCash';
    case 'bank_transfer':
      return 'Bank Transfer';
    default:
      return 'Unknown';
  }
};

// Helper function to get payment method icon
export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  switch (method) {
    case 'gcash':
      return '📱';
    case 'bank_transfer':
      return '🏦';
    default:
      return '💳';
  }
};
