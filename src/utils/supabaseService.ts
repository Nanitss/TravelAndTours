import { supabase } from './supabase';

// Role types
export enum UserRole {
  CLIENT = 1,
  ADMIN = 2
}

// Types for our tables
export interface User {
  id?: string;
  Email?: string;
  email?: string;
  Password?: string;
  password?: string;
  Username?: string;
  name?: string;
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  role?: UserRole;
  createdAt?: any;
  updatedAt?: any;
}

export interface Tour {
  id?: string;
  title: string;
  description: string;
  destination: string;
  duration: number;
  price: number;
  startDate: string;
  endDate: string;
  availabilityUntil: string;
  imageUrl?: string;
  isActive: boolean;
  maxParticipants?: number;
  highlights?: string[];
  included?: string[];
  itinerary?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Booking {
  id?: string;
  bookingId: string;
  userId: string;
  tourId: string;
  tourTitle: string;
  participants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ongoing' | 'cancelled' | 'completed' | 'failed';
  bookingDate: string;
  travelDate: string;
  departureDate?: string;
  specialRequests?: string;
  customerName: string;
  customerEmail: string;
  hasRescheduled?: boolean;
  paymentType: 'full' | 'partial';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentIntentId?: string;
  transactionId?: string;
  amountPaid: number;
  amountRemaining: number;
  dueDate?: string;
  paymentDate?: string;
  daysUntilDue?: number;
  refundAmount?: number;
  refundDate?: string;
  isVoided?: boolean;
  voidReason?: string;
  voidDate?: string;
  rebookCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Rating {
  id?: string;
  bookingId: string;
  tourId: string;
  tourTitle: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment?: string;
  createdAt: any;
  travelDate: string;
}

export interface Destination {
  id?: string;
  name: string;
  country: string;
  description: string;
  imageUrl?: string;
  popularAttractions: string[];
  bestTimeToVisit: string;
  climate: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface RecentActivity {
  id?: string;
  type: 'booking' | 'package_created' | 'package_updated' | 'user_registered';
  title: string;
  description: string;
  timestamp: any;
  userId?: string;
  relatedId?: string;
  createdAt?: any;
}

// Payment Interface
export interface Payment {
  id?: string;
  paymentIntentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymongoPaymentId?: string;
  customerEmail: string;
  customerName: string;
  transactionId?: string;
  gatewayResponse?: any;
  failureReason?: string;
  processedAt?: string;
  paymentType?: 'initial' | 'remaining' | 'full';
  paymentNumber?: number;
  isPartialPayment?: boolean;
  originalAmount?: number;
  amountPaid?: number;
  amountRemaining?: number;
  totalPaid?: number;
  dueDate?: string;
  isOverdue?: boolean;
  daysUntilDue?: number;
  paymentStatus?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  isVoided?: boolean;
  voidReason?: string;
  voidDate?: string;
  refundRequested?: boolean;
  refundAmount?: number;
  refundReason?: string;
  refundStatus?: 'pending' | 'approved' | 'rejected' | 'processed';
  refundDate?: string;
  adminNotes?: string;
  processedBy?: string;
  commission?: number;
  netAmount?: number;
  createdAt?: any;
  updatedAt?: any;
}

// Sales Analytics Interface
export interface SalesRecord {
  id?: string;
  bookingId: string;
  tourId: string;
  tourTitle: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'paid' | 'refunded';
  bookingDate: string;
  paymentDate: string;
  commission?: number;
  netAmount: number;
  createdAt?: any;
  updatedAt?: any;
}

// Date Availability Interface
export interface DateAvailability {
  id?: string;
  tourId: string;
  date: string;
  isAvailable: boolean;
  bookingId?: string;
  userId?: string;
  status: 'available' | 'booked' | 'blocked';
  createdAt?: any;
  updatedAt?: any;
}

// Table names
const TABLES = {
  USERS: 'users',
  TOURS: 'tours',
  BOOKINGS: 'bookings',
  DESTINATIONS: 'destinations',
  ACTIVITIES: 'recent_activities',
  PAYMENTS: 'payments',
  SALES: 'sales',
  DATE_AVAILABILITY: 'date_availability',
  RATINGS: 'ratings'
} as const;

// Generic CRUD operations
export class SupabaseDataService {
  // Create a new document
  static async create<T>(tableName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const { data: result, error } = await supabase
        .from(tableName)
        .insert({
          ...data,
          createdAt: now,
          updatedAt: now
        })
        .select('id')
        .single();

      if (error) throw error;
      return result.id;
    } catch (error) {
      console.error(`Error creating document in ${tableName}:`, error);
      throw error;
    }
  }

  // Get a single document by ID
  static async getById<T>(tableName: string, id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data as T;
    } catch (error) {
      console.error(`Error getting document from ${tableName}:`, error);
      throw error;
    }
  }

  // Get all documents from a table
  static async getAll<T>(tableName: string): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) throw error;
      return (data || []) as T[];
    } catch (error) {
      console.error(`Error getting all documents from ${tableName}:`, error);
      throw error;
    }
  }

  // Update a document
  static async update<T>(tableName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      console.log(`🔄 Updating document in ${tableName} with ID: ${id}`);

      const now = new Date().toISOString();
      const updateData = {
        ...data,
        updatedAt: now
      };

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      console.log(`✅ Successfully updated document in ${tableName}`);
    } catch (error) {
      console.error(`❌ Error updating document in ${tableName}:`, error);
      throw error;
    }
  }

  // Delete a document
  static async delete(tableName: string, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting document from ${tableName}:`, error);
      throw error;
    }
  }

  // Query documents with conditions
  static async query<T>(
    tableName: string,
    conditions: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      console.log(`Querying ${tableName} with conditions:`, conditions);
      let queryBuilder = supabase.from(tableName).select('*');

      // Apply where conditions
      conditions.forEach(condition => {
        const op = condition.operator;
        if (op === '==' || op === 'eq') {
          queryBuilder = queryBuilder.eq(condition.field, condition.value);
        } else if (op === '!=' || op === 'neq') {
          queryBuilder = queryBuilder.neq(condition.field, condition.value);
        } else if (op === '>' || op === 'gt') {
          queryBuilder = queryBuilder.gt(condition.field, condition.value);
        } else if (op === '>=' || op === 'gte') {
          queryBuilder = queryBuilder.gte(condition.field, condition.value);
        } else if (op === '<' || op === 'lt') {
          queryBuilder = queryBuilder.lt(condition.field, condition.value);
        } else if (op === '<=' || op === 'lte') {
          queryBuilder = queryBuilder.lte(condition.field, condition.value);
        } else if (op === 'in') {
          queryBuilder = queryBuilder.in(condition.field, condition.value);
        } else {
          // Default to eq
          queryBuilder = queryBuilder.eq(condition.field, condition.value);
        }
      });

      // Apply ordering if specified
      if (orderByField) {
        queryBuilder = queryBuilder.order(orderByField, { ascending: orderDirection === 'asc' });
      }

      // Apply limit if specified
      if (limitCount) {
        queryBuilder = queryBuilder.limit(limitCount);
      }

      console.log('Executing Supabase query...');
      const { data, error } = await queryBuilder;

      if (error) throw error;

      const results = (data || []) as T[];
      console.log('Query results count:', results.length);
      return results;
    } catch (error) {
      console.error(`Error querying ${tableName}:`, error);
      throw error;
    }
  }
}

// Specific service methods for each table
export class UserService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return SupabaseDataService.create<User>(TABLES.USERS, userData);
  }

  static async getUserById(id: string): Promise<User | null> {
    return SupabaseDataService.getById<User>(TABLES.USERS, id);
  }

  static async getAllUsers(): Promise<User[]> {
    return SupabaseDataService.getAll<User>(TABLES.USERS);
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<void> {
    return SupabaseDataService.update<User>(TABLES.USERS, id, userData);
  }

  static async deleteUser(id: string): Promise<void> {
    return SupabaseDataService.delete(TABLES.USERS, id);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('Searching for user with email:', email);

      // Try to find user with lowercase 'email' field first
      let { data: users, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .ilike('email', email);

      if (error) throw error;

      if (users && users.length > 0) {
        console.log('Found user with email field:', users[0]);
        return users[0] as User;
      }

      // If not found, try case-insensitive search on all users
      console.log('Not found with email field, trying broader search...');
      const { data: allUsers, error: allError } = await supabase
        .from(TABLES.USERS)
        .select('*');

      if (allError) throw allError;

      if (allUsers) {
        const foundUser = allUsers.find((user: any) => {
          const userEmail = user.Email || user.email;
          return userEmail && userEmail.toLowerCase() === email.toLowerCase();
        });

        if (foundUser) {
          console.log('Found user with case-insensitive match:', foundUser);
          return foundUser as User;
        }
      }

      console.log('No user found with email:', email);
      return null;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }
}

export class TourService {
  static async createTour(tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return SupabaseDataService.create<Tour>(TABLES.TOURS, tourData);
  }

  static async getTourById(id: string): Promise<Tour | null> {
    return SupabaseDataService.getById<Tour>(TABLES.TOURS, id);
  }

  static async getAllTours(): Promise<Tour[]> {
    return SupabaseDataService.getAll<Tour>(TABLES.TOURS);
  }

  static async getActiveTours(): Promise<Tour[]> {
    return SupabaseDataService.query<Tour>(
      TABLES.TOURS,
      [{ field: 'isActive', operator: '==', value: true }],
      'startDate',
      'asc'
    );
  }

  static async getToursByDestination(destination: string): Promise<Tour[]> {
    return SupabaseDataService.query<Tour>(
      TABLES.TOURS,
      [
        { field: 'destination', operator: '==', value: destination },
        { field: 'isActive', operator: '==', value: true }
      ],
      'startDate',
      'asc'
    );
  }

  static async updateTour(id: string, tourData: Partial<Tour>): Promise<void> {
    return SupabaseDataService.update<Tour>(TABLES.TOURS, id, tourData);
  }

  static async deleteTour(id: string): Promise<void> {
    return SupabaseDataService.delete(TABLES.TOURS, id);
  }
}

export class BookingService {
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return SupabaseDataService.create<Booking>(TABLES.BOOKINGS, bookingData);
  }

  static async getBookingById(id: string): Promise<Booking | null> {
    return SupabaseDataService.getById<Booking>(TABLES.BOOKINGS, id);
  }

  static async getAllBookings(): Promise<Booking[]> {
    return SupabaseDataService.getAll<Booking>(TABLES.BOOKINGS);
  }

  static async getBookingsByUser(userId: string): Promise<Booking[]> {
    return SupabaseDataService.query<Booking>(
      TABLES.BOOKINGS,
      [{ field: 'userId', operator: '==', value: userId }],
      'bookingDate',
      'desc'
    );
  }

  static async getBookingsByTour(tourId: string): Promise<Booking[]> {
    return SupabaseDataService.query<Booking>(
      TABLES.BOOKINGS,
      [{ field: 'tourId', operator: '==', value: tourId }],
      'bookingDate',
      'desc'
    );
  }

  static async updateBooking(id: string, bookingData: Partial<Booking>): Promise<void> {
    return SupabaseDataService.update<Booking>(TABLES.BOOKINGS, id, bookingData);
  }

  static async deleteBooking(id: string): Promise<void> {
    return SupabaseDataService.delete(TABLES.BOOKINGS, id);
  }
}

export class DestinationService {
  static async createDestination(destinationData: Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return SupabaseDataService.create<Destination>(TABLES.DESTINATIONS, destinationData);
  }

  static async getDestinationById(id: string): Promise<Destination | null> {
    return SupabaseDataService.getById<Destination>(TABLES.DESTINATIONS, id);
  }

  static async getAllDestinations(): Promise<Destination[]> {
    return SupabaseDataService.getAll<Destination>(TABLES.DESTINATIONS);
  }

  static async getDestinationsByCountry(country: string): Promise<Destination[]> {
    return SupabaseDataService.query<Destination>(
      TABLES.DESTINATIONS,
      [{ field: 'country', operator: '==', value: country }]
    );
  }

  static async updateDestination(id: string, destinationData: Partial<Destination>): Promise<void> {
    return SupabaseDataService.update<Destination>(TABLES.DESTINATIONS, id, destinationData);
  }

  static async deleteDestination(id: string): Promise<void> {
    return SupabaseDataService.delete(TABLES.DESTINATIONS, id);
  }
}

export class ActivityService {
  static async createActivity(activityData: Omit<RecentActivity, 'id' | 'createdAt'>): Promise<string> {
    return SupabaseDataService.create<RecentActivity>(TABLES.ACTIVITIES, activityData);
  }

  static async getRecentActivities(limitCount: number = 10): Promise<RecentActivity[]> {
    return SupabaseDataService.query<RecentActivity>(
      TABLES.ACTIVITIES,
      [],
      'timestamp',
      'desc',
      limitCount
    );
  }

  static async getActivitiesByType(type: RecentActivity['type']): Promise<RecentActivity[]> {
    return SupabaseDataService.query<RecentActivity>(
      TABLES.ACTIVITIES,
      [{ field: 'type', operator: '==', value: type }],
      'timestamp',
      'desc'
    );
  }
}

// Payment Service for Supabase operations
export class PaymentService {
  static async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return SupabaseDataService.create<Payment>(TABLES.PAYMENTS, paymentData);
  }

  static async getPaymentById(id: string): Promise<Payment | null> {
    return SupabaseDataService.getById<Payment>(TABLES.PAYMENTS, id);
  }

  static async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return SupabaseDataService.query<Payment>(
      TABLES.PAYMENTS,
      [{ field: 'bookingId', operator: '==', value: bookingId }],
      'createdAt',
      'desc'
    );
  }

  static async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return SupabaseDataService.query<Payment>(
      TABLES.PAYMENTS,
      [{ field: 'customerEmail', operator: '==', value: userId }]
    );
  }

  static async getAllPayments(): Promise<Payment[]> {
    return SupabaseDataService.getAll<Payment>(TABLES.PAYMENTS);
  }

  static async updatePayment(id: string, paymentData: Partial<Payment>): Promise<void> {
    return SupabaseDataService.update<Payment>(TABLES.PAYMENTS, id, paymentData);
  }

  static async deletePayment(id: string): Promise<void> {
    return SupabaseDataService.delete(TABLES.PAYMENTS, id);
  }
}

// Sales Service for tracking sales and analytics
export class SalesService {
  static async createSalesRecord(salesData: Omit<SalesRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return SupabaseDataService.create<SalesRecord>(TABLES.SALES, salesData);
  }

  static async getSalesRecordById(id: string): Promise<SalesRecord | null> {
    return SupabaseDataService.getById<SalesRecord>(TABLES.SALES, id);
  }

  static async getAllSales(): Promise<SalesRecord[]> {
    return SupabaseDataService.getAll<SalesRecord>(TABLES.SALES);
  }

  static async getSalesByDateRange(startDate: string, endDate: string): Promise<SalesRecord[]> {
    return SupabaseDataService.query<SalesRecord>(
      TABLES.SALES,
      [
        { field: 'paymentDate', operator: '>=', value: startDate },
        { field: 'paymentDate', operator: '<=', value: endDate }
      ],
      'paymentDate',
      'desc'
    );
  }

  static async getSalesByTour(tourId: string): Promise<SalesRecord[]> {
    return SupabaseDataService.query<SalesRecord>(
      TABLES.SALES,
      [{ field: 'tourId', operator: '==', value: tourId }],
      'paymentDate',
      'desc'
    );
  }

  static async getTotalSales(): Promise<number> {
    const sales = await this.getAllSales();
    return sales
      .filter(sale => sale.paymentStatus === 'paid')
      .reduce((total, sale) => total + sale.amount, 0);
  }

  static async getSalesByPaymentMethod(): Promise<{ [key: string]: number }> {
    const sales = await this.getAllSales();
    const salesByMethod: { [key: string]: number } = {};

    sales
      .filter(sale => sale.paymentStatus === 'paid')
      .forEach(sale => {
        salesByMethod[sale.paymentMethod] = (salesByMethod[sale.paymentMethod] || 0) + sale.amount;
      });

    return salesByMethod;
  }

  static async getAllSalesRecords(): Promise<SalesRecord[]> {
    return SupabaseDataService.getAll<SalesRecord>(TABLES.SALES);
  }

  static async updateSalesRecord(id: string, salesData: Partial<SalesRecord>): Promise<void> {
    return SupabaseDataService.update<SalesRecord>(TABLES.SALES, id, salesData);
  }

  static async deleteSalesRecord(id: string): Promise<void> {
    return SupabaseDataService.delete(TABLES.SALES, id);
  }
}

export class DateAvailabilityService {
  static async checkDateAvailability(tourId: string, date: string): Promise<boolean> {
    try {
      const availability = await SupabaseDataService.query<DateAvailability>(
        TABLES.DATE_AVAILABILITY,
        [
          { field: 'tourId', operator: '==', value: tourId },
          { field: 'date', operator: '==', value: date }
        ]
      );

      // If no record exists, date is available
      if (availability.length === 0) {
        return true;
      }

      // Check if any record shows the date as available
      return availability.some(record => record.isAvailable && record.status === 'available');
    } catch (error) {
      console.error('Error checking date availability:', error);
      return false;
    }
  }

  static async bookDate(tourId: string, date: string, bookingId: string, userId: string): Promise<string> {
    const availabilityData: Omit<DateAvailability, 'id' | 'createdAt' | 'updatedAt'> = {
      tourId,
      date,
      isAvailable: false,
      bookingId,
      userId,
      status: 'booked'
    };

    return SupabaseDataService.create<DateAvailability>(TABLES.DATE_AVAILABILITY, availabilityData);
  }

  static async releaseDate(tourId: string, date: string): Promise<void> {
    try {
      const availability = await SupabaseDataService.query<DateAvailability>(
        TABLES.DATE_AVAILABILITY,
        [
          { field: 'tourId', operator: '==', value: tourId },
          { field: 'date', operator: '==', value: date }
        ]
      );

      // Delete the availability record to make date available again
      for (const record of availability) {
        if (record.id) {
          await SupabaseDataService.delete(TABLES.DATE_AVAILABILITY, record.id);
        }
      }
    } catch (error) {
      console.error('Error releasing date:', error);
    }
  }

  static async getBookedDatesForTour(tourId: string): Promise<DateAvailability[]> {
    return SupabaseDataService.query<DateAvailability>(
      TABLES.DATE_AVAILABILITY,
      [
        { field: 'tourId', operator: '==', value: tourId },
        { field: 'status', operator: '==', value: 'booked' }
      ]
    );
  }

  static async getBookedDatesForUser(userId: string): Promise<DateAvailability[]> {
    return SupabaseDataService.query<DateAvailability>(
      TABLES.DATE_AVAILABILITY,
      [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: 'booked' }
      ]
    );
  }
}

// Helper function to initialize sample data
export async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingTours = await TourService.getAllTours();
    if (existingTours.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    // Create sample destinations
    const destinations = [
      {
        name: 'Bali',
        country: 'Indonesia',
        description: 'A tropical paradise with beautiful beaches, temples, and vibrant culture.',
        imageUrl: '/assets/bali, indonesia.jpg',
        popularAttractions: ['Ubud', 'Tanah Lot Temple', 'Mount Batur', 'Seminyak Beach'],
        bestTimeToVisit: 'April to October',
        climate: 'Tropical'
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        description: 'A bustling metropolis blending traditional culture with modern technology.',
        imageUrl: '/assets/tokyo, japan.jpg',
        popularAttractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Meiji Shrine'],
        bestTimeToVisit: 'March to May, September to November',
        climate: 'Temperate'
      },
      {
        name: 'Boracay',
        country: 'Philippines',
        description: 'World-famous white sand beaches and crystal clear waters.',
        imageUrl: '/assets/boracay, philippines.jpg',
        popularAttractions: ['White Beach', 'Puka Shell Beach', 'Mount Luho', 'Diniwid Beach'],
        bestTimeToVisit: 'November to May',
        climate: 'Tropical'
      },
      {
        name: 'Mount Fuji',
        country: 'Japan',
        description: 'Japan\'s most iconic mountain and a UNESCO World Heritage site.',
        imageUrl: '/assets/mount-fuji.jpg',
        popularAttractions: ['Fuji Five Lakes', 'Chureito Pagoda', 'Arakurayama Sengen Park'],
        bestTimeToVisit: 'July to September',
        climate: 'Temperate'
      },
      {
        name: 'New York',
        country: 'USA',
        description: 'The city that never sleeps, full of iconic landmarks and cultural diversity.',
        imageUrl: '/assets/new york, usa.jpg',
        popularAttractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
        bestTimeToVisit: 'April to June, September to November',
        climate: 'Continental'
      }
    ];

    // Create sample tours
    const tours = [
      {
        title: 'Bali Adventure Package',
        description: 'Experience the best of Bali with this comprehensive 7-day tour including cultural sites, beaches, and adventure activities.',
        destination: 'Bali',
        duration: 7,
        price: 60000,
        startDate: '2024-03-15',
        endDate: '2024-03-22',
        availabilityUntil: '2024-12-31',
        imageUrl: '/assets/bali, indonesia.jpg',
        isActive: true
      },
      {
        title: 'Tokyo Cultural Experience',
        description: 'Discover Tokyo\'s rich culture and modern attractions in this 5-day guided tour.',
        destination: 'Tokyo',
        duration: 5,
        price: 90000,
        startDate: '2024-04-10',
        endDate: '2024-04-15',
        availabilityUntil: '2024-12-31',
        imageUrl: '/assets/tokyo, japan.jpg',
        isActive: true
      },
      {
        title: 'Boracay Beach Paradise',
        description: 'Relax and unwind on the pristine beaches of Boracay with this 6-day beach getaway.',
        destination: 'Boracay',
        duration: 6,
        price: 45000,
        startDate: '2024-05-20',
        endDate: '2024-05-26',
        availabilityUntil: '2024-12-31',
        imageUrl: '/assets/boracay, philippines.jpg',
        isActive: true
      },
      {
        title: 'Mount Fuji Climbing Expedition',
        description: 'Challenge yourself with a guided climb to the summit of Mount Fuji, Japan\'s most iconic mountain.',
        destination: 'Mount Fuji',
        duration: 3,
        price: 35000,
        startDate: '2024-07-15',
        endDate: '2024-07-18',
        availabilityUntil: '2024-12-31',
        imageUrl: '/assets/mount-fuji.jpg',
        isActive: true
      },
      {
        title: 'New York City Explorer',
        description: 'Explore the Big Apple with this 4-day tour covering all major attractions and hidden gems.',
        destination: 'New York',
        duration: 4,
        price: 75000,
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        availabilityUntil: '2024-12-31',
        imageUrl: '/assets/new york, usa.jpg',
        isActive: true
      }
    ];

    // Add destinations to Supabase
    console.log('Creating sample destinations...');
    for (const destination of destinations) {
      await DestinationService.createDestination(destination);
    }

    // Add tours to Supabase
    console.log('Creating sample tours...');
    for (const tour of tours) {
      await TourService.createTour(tour);
    }

    console.log('Sample data created successfully!');
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
}

export class RatingService {
  private static tableName = TABLES.RATINGS;

  /**
   * Create a new rating
   */
  static async createRating(ratingData: Omit<Rating, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Creating rating:', ratingData);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...ratingData,
          createdAt: now
        })
        .select('id')
        .single();

      if (error) throw error;
      console.log('Rating created with ID:', data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  /**
   * Get all ratings
   */
  static async getAllRatings(): Promise<Rating[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*');

      if (error) throw error;
      return (data || []) as Rating[];
    } catch (error) {
      console.error('Error getting ratings:', error);
      throw error;
    }
  }

  /**
   * Get ratings for a specific tour
   */
  static async getRatingsByTour(tourId: string): Promise<Rating[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('tourId', tourId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return (data || []) as Rating[];
    } catch (error) {
      console.error('Error getting ratings by tour:', error);
      throw error;
    }
  }

  /**
   * Get ratings by user
   */
  static async getRatingsByUser(userId: string): Promise<Rating[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return (data || []) as Rating[];
    } catch (error) {
      console.error('Error getting ratings by user:', error);
      throw error;
    }
  }

  /**
   * Get rating for a specific booking
   */
  static async getRatingByBooking(bookingId: string): Promise<Rating | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('bookingId', bookingId)
        .maybeSingle();

      if (error) throw error;
      return data as Rating | null;
    } catch (error) {
      console.error('Error getting rating by booking:', error);
      throw error;
    }
  }

  /**
   * Update a rating
   */
  static async updateRating(ratingId: string, updates: Partial<Rating>): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', ratingId);

      if (error) throw error;
      console.log('Rating updated successfully');
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  }

  /**
   * Delete a rating
   */
  static async deleteRating(ratingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', ratingId);

      if (error) throw error;
      console.log('Rating deleted successfully');
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  }

  /**
   * Get average rating for a tour
   */
  static async getAverageRating(tourId: string): Promise<{ average: number; count: number }> {
    try {
      const ratings = await this.getRatingsByTour(tourId);

      if (ratings.length === 0) {
        return { average: 0, count: 0 };
      }

      const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const average = total / ratings.length;

      return { average: Math.round(average * 10) / 10, count: ratings.length };
    } catch (error) {
      console.error('Error getting average rating:', error);
      throw error;
    }
  }
}

export { TABLES as COLLECTIONS, SupabaseDataService as FirebaseService };
