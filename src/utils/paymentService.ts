// Mock Payment Service - replaces PayMongo API calls

// Mock Payment Configuration
const MOCK_PAYMENT_CONFIG = {
  simulatedDelayMs: 2000, // 2 second delay to simulate processing
  successRate: 1.0, // 100% success rate for mock payments
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
  mockPaymentId?: string;
  customerEmail: string;
  customerName: string;
  createdAt?: any;
  updatedAt?: any;
}

// Helper to generate mock IDs
const generateMockId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to simulate network delay
const simulateDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Payment Service Class (Mock Implementation)
export class PaymentService {
  // Create Payment Intent (Mock)
  static async createPaymentIntent(
    amount: number,
    currency: string = 'PHP',
    paymentMethod: PaymentMethod
  ): Promise<PaymentIntent> {
    try {
      console.log('🔄 [Mock] Creating payment intent...');
      await simulateDelay(500);

      const mockIntent: PaymentIntent = {
        id: generateMockId('pi'),
        amount: amount * 100,
        currency: currency,
        payment_method_allowed: [paymentMethod],
        status: 'pending',
        client_key: generateMockId('ck'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('✅ [Mock] Payment intent created:', mockIntent.id);
      return mockIntent;
    } catch (error) {
      console.error('Error creating mock payment intent:', error);
      throw error;
    }
  }

  // Attach Payment Method to Intent (Mock)
  static async attachPaymentMethod(
    paymentIntentId: string,
    paymentMethodId: string,
    paymentMethod: PaymentMethod
  ): Promise<Payment> {
    try {
      console.log('🔄 [Mock] Attaching payment method...');
      await simulateDelay(500);

      const mockPayment = {
        id: generateMockId('pay'),
        type: 'payment',
        attributes: {
          status: 'succeeded',
          amount: 0,
          currency: 'PHP',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      } as any;

      console.log('✅ [Mock] Payment method attached successfully');
      return mockPayment;
    } catch (error) {
      console.error('Error attaching mock payment method:', error);
      throw error;
    }
  }

  // Get Payment Intent Status (Mock)
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      console.log('🔄 [Mock] Getting payment intent status...');
      await simulateDelay(300);

      const mockIntent: PaymentIntent = {
        id: paymentIntentId,
        amount: 0,
        currency: 'PHP',
        payment_method_allowed: ['gcash'],
        status: 'succeeded',
        client_key: generateMockId('ck'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return mockIntent;
    } catch (error) {
      console.error('Error getting mock payment status:', error);
      throw error;
    }
  }

  // Create Payment Method (Mock)
  static async createPaymentMethod(
    type: PaymentMethod,
    billing: {
      name: string;
      email: string;
      phone: string;
    }
  ): Promise<PaymentMethodData> {
    try {
      console.log('🔄 [Mock] Creating payment method...');
      await simulateDelay(300);

      const mockMethod: PaymentMethodData = {
        id: generateMockId('pm'),
        type: type,
        billing: billing,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('✅ [Mock] Payment method created:', mockMethod.id);
      return mockMethod;
    } catch (error) {
      console.error('Error creating mock payment method:', error);
      throw error;
    }
  }

  // Create Checkout Session (Mock - no external redirect needed)
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
      console.log('🔄 [Mock] Creating checkout session...');
      
      // Validate inputs
      if (amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      
      if (!customerInfo.name || !customerInfo.email) {
        throw new Error('Customer information is required');
      }

      // Simulate payment processing delay
      await simulateDelay(MOCK_PAYMENT_CONFIG.simulatedDelayMs);

      // Determine if payment succeeds based on success rate
      const isSuccess = Math.random() < MOCK_PAYMENT_CONFIG.successRate;

      if (!isSuccess) {
        throw new Error('Payment was declined. Please try again.');
      }

      const sessionId = generateMockId('cs');

      console.log('✅ [Mock] Checkout session created:', sessionId);

      // Return a URL pointing to our own payment success page (simulating the redirect flow)
      const successUrl = `${window.location.origin}/payment/success?session_id=${sessionId}`;

      return {
        checkoutUrl: successUrl,
        sessionId,
        success: true,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      console.error('❌ [Mock] Checkout session creation failed:', error);
      
      let errorMessage = 'Unable to process payment';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid payment amount')) {
          errorMessage = 'Please enter a valid payment amount';
        } else if (error.message.includes('Customer information is required')) {
          errorMessage = 'Please provide complete customer information';
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

  // Process Payment (Mock - Redirection Flow)
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

  // Verify Payment Status (Mock)
  static async verifyPayment(paymentIntentId: string): Promise<{
    status: PaymentStatus;
    success: boolean;
    message: string;
  }> {
    try {
      if (!paymentIntentId) {
        throw new Error('Payment intent ID is required');
      }

      console.log('🔄 [Mock] Verifying payment...');
      await simulateDelay(500);

      return {
        status: 'succeeded',
        success: true,
        message: 'Payment verified successfully'
      };
    } catch (error) {
      console.error('❌ [Mock] Payment verification failed:', error);
      
      let errorMessage = 'Payment verification failed';
      if (error instanceof Error) {
        errorMessage = error.message;
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
