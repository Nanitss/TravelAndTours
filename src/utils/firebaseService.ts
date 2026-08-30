import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Role types
export enum UserRole {
  CLIENT = 1,
  ADMIN = 2
}

// Types for our collections
export interface User {
  id?: string;
  Email?: string; // Capital E to match your Firestore
  email?: string; // Lowercase for compatibility
  Password?: string; // Capital P to match your Firestore
  password?: string; // Lowercase for compatibility
  Username?: string; // Capital U to match your Firestore
  name?: string; // Lowercase for compatibility
  phone?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: string;
  role?: UserRole; // 1 = Client, 2 = Admin
  createdAt?: any;
  updatedAt?: any;
}

export interface Tour {
  id?: string;
  title: string;
  description: string;
  destination: string;
  duration: number; // in days
  price: number;
  startDate: string;
  endDate: string;
  availabilityUntil: string; // when the package stops being available
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
  bookingId: string; // unique booking reference
  userId: string;
  tourId: string;
  tourTitle: string; // store tour title for easier display
  participants: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ongoing' | 'cancelled' | 'completed' | 'failed';
  bookingDate: string;
  travelDate: string; // when they want to travel
  departureDate?: string; // departure date for the trip
  specialRequests?: string;
  customerName: string;
  customerEmail: string;
  hasRescheduled?: boolean; // flag to track if user has already rescheduled
  // Payment related fields
  paymentType: 'full' | 'partial';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentIntentId?: string;
  transactionId?: string;
  // Payment amounts
  amountPaid: number; // actual amount received
  amountRemaining: number; // amount still owed
  dueDate?: string; // when remaining payment is due
  paymentDate?: string; // when payment was completed
  daysUntilDue?: number; // number of days until payment is due
  // Refund fields
  refundAmount?: number; // if refunded
  refundDate?: string; // when refund was processed
  // Booking management
  isVoided?: boolean; // if booking was voided due to non-payment
  voidReason?: string; // reason for voiding
  voidDate?: string; // when booking was voided
  rebookCount?: number; // how many times user has rescheduled (max 1)
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
  rating: number; // 1-5 stars
  comment?: string; // optional review text
  createdAt: any;
  travelDate: string; // when the trip was taken
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
  relatedId?: string; // booking ID, package ID, etc.
  createdAt?: any;
}

// Collection names
const COLLECTIONS = {
  USERS: 'Users', // Changed to match your Firestore collection name
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
export class FirebaseService {
  // Create a new document
  static async create<T>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

// Get a single document by ID
static async getById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

// Get all documents from a collection
static async getAll<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    })) as T[];
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    throw error;
  }
}

// Update a document
  static async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      console.log(`🔄 Updating document in ${collectionName} with ID: ${id}`);
      console.log(`🔄 Update data:`, data);
      
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      console.log(`🔄 Final update data:`, updateData);
      
      await updateDoc(docRef, updateData);
      
      console.log(`✅ Successfully updated document in ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

// Delete a document
static async delete(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

// Query documents with conditions
static async query<T>(
  collectionName: string, 
  conditions: Array<{ field: string; operator: any; value: any }>,
  orderByField?: string,
  orderDirection?: 'asc' | 'desc',
  limitCount?: number
): Promise<T[]> {
  try {
    console.log(`Querying ${collectionName} with conditions:`, conditions);
    const collectionRef = collection(db, collectionName);
    
    // Start with where conditions
    let q: any = collectionRef;
    
    // Apply where conditions
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    // Apply ordering if specified
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection || 'asc'));
    }
    
    // Apply limit if specified
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query executed, found documents:', querySnapshot.docs.length);
    
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    })) as T[];
    
    console.log('Query results:', results);
    return results;
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
}
}

// Specific service methods for each collection
export class UserService {
  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<User>(COLLECTIONS.USERS, userData);
  }

  static async getUserById(id: string): Promise<User | null> {
    return FirebaseService.getById<User>(COLLECTIONS.USERS, id);
  }

  static async getAllUsers(): Promise<User[]> {
    return FirebaseService.getAll<User>(COLLECTIONS.USERS);
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<void> {
    return FirebaseService.update<User>(COLLECTIONS.USERS, id, userData);
  }

  static async deleteUser(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.USERS, id);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('Searching for user with email:', email);
      
      // Try to find user with lowercase 'email' field first
      let users = await FirebaseService.query<User>(
        COLLECTIONS.USERS,
        [{ field: 'email', operator: '==', value: email }]
      );
      
      // If not found, try with uppercase 'Email' field
      if (users.length === 0) {
        console.log('Not found with lowercase email, trying uppercase Email...');
        users = await FirebaseService.query<User>(
          COLLECTIONS.USERS,
          [{ field: 'Email', operator: '==', value: email }]
        );
      }
      
      // If still not found, try case-insensitive search by getting all users
      if (users.length === 0) {
        console.log('Not found with exact match, trying case-insensitive search...');
        const allUsers = await FirebaseService.getAll<User>(COLLECTIONS.USERS);
        console.log('All users in database:', allUsers);
        
        // Find user with case-insensitive email match
        const foundUser = allUsers.find(user => {
          const userEmail = user.Email || user.email;
          return userEmail && userEmail.toLowerCase() === email.toLowerCase();
        });
        
        if (foundUser) {
          console.log('Found user with case-insensitive match:', foundUser);
          return foundUser;
        }
      }
      
      console.log('Query result:', users);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }
}

export class TourService {
  static async createTour(tourData: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Tour>(COLLECTIONS.TOURS, tourData);
  }

  static async getTourById(id: string): Promise<Tour | null> {
    return FirebaseService.getById<Tour>(COLLECTIONS.TOURS, id);
  }

  static async getAllTours(): Promise<Tour[]> {
    return FirebaseService.getAll<Tour>(COLLECTIONS.TOURS);
  }

  static async getActiveTours(): Promise<Tour[]> {
    return FirebaseService.query<Tour>(
      COLLECTIONS.TOURS,
      [{ field: 'isActive', operator: '==', value: true }],
      'startDate',
      'asc'
    );
  }

  static async getToursByDestination(destination: string): Promise<Tour[]> {
    return FirebaseService.query<Tour>(
      COLLECTIONS.TOURS,
      [
        { field: 'destination', operator: '==', value: destination },
        { field: 'isActive', operator: '==', value: true }
      ],
      'startDate',
      'asc'
    );
  }

  static async updateTour(id: string, tourData: Partial<Tour>): Promise<void> {
    return FirebaseService.update<Tour>(COLLECTIONS.TOURS, id, tourData);
  }

  static async deleteTour(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.TOURS, id);
  }
}

export class BookingService {
  static async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Booking>(COLLECTIONS.BOOKINGS, bookingData);
  }

  static async getBookingById(id: string): Promise<Booking | null> {
    return FirebaseService.getById<Booking>(COLLECTIONS.BOOKINGS, id);
  }

  static async getAllBookings(): Promise<Booking[]> {
    return FirebaseService.getAll<Booking>(COLLECTIONS.BOOKINGS);
  }

  static async getBookingsByUser(userId: string): Promise<Booking[]> {
    return FirebaseService.query<Booking>(
      COLLECTIONS.BOOKINGS,
      [{ field: 'userId', operator: '==', value: userId }],
      'bookingDate',
      'desc'
    );
  }

  static async getBookingsByTour(tourId: string): Promise<Booking[]> {
    return FirebaseService.query<Booking>(
      COLLECTIONS.BOOKINGS,
      [{ field: 'tourId', operator: '==', value: tourId }],
      'bookingDate',
      'desc'
    );
  }

  static async updateBooking(id: string, bookingData: Partial<Booking>): Promise<void> {
    return FirebaseService.update<Booking>(COLLECTIONS.BOOKINGS, id, bookingData);
  }

  static async deleteBooking(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.BOOKINGS, id);
  }
}

export class DestinationService {
  static async createDestination(destinationData: Omit<Destination, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Destination>(COLLECTIONS.DESTINATIONS, destinationData);
  }

  static async getDestinationById(id: string): Promise<Destination | null> {
    return FirebaseService.getById<Destination>(COLLECTIONS.DESTINATIONS, id);
  }

  static async getAllDestinations(): Promise<Destination[]> {
    return FirebaseService.getAll<Destination>(COLLECTIONS.DESTINATIONS);
  }

  static async getDestinationsByCountry(country: string): Promise<Destination[]> {
    return FirebaseService.query<Destination>(
      COLLECTIONS.DESTINATIONS,
      [{ field: 'country', operator: '==', value: country }]
    );
  }

  static async updateDestination(id: string, destinationData: Partial<Destination>): Promise<void> {
    return FirebaseService.update<Destination>(COLLECTIONS.DESTINATIONS, id, destinationData);
  }

  static async deleteDestination(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.DESTINATIONS, id);
  }
}

export class ActivityService {
  static async createActivity(activityData: Omit<RecentActivity, 'id' | 'createdAt'>): Promise<string> {
    return FirebaseService.create<RecentActivity>(COLLECTIONS.ACTIVITIES, activityData);
  }

  static async getRecentActivities(limitCount: number = 10): Promise<RecentActivity[]> {
    return FirebaseService.query<RecentActivity>(
      COLLECTIONS.ACTIVITIES,
      [],
      'timestamp',
      'desc',
      limitCount
    );
  }

  static async getActivitiesByType(type: RecentActivity['type']): Promise<RecentActivity[]> {
    return FirebaseService.query<RecentActivity>(
      COLLECTIONS.ACTIVITIES,
      [{ field: 'type', operator: '==', value: type }],
      'timestamp',
      'desc'
    );
  }
}

// Payment Service for Firestore operations
export class PaymentService {
  static async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<Payment>(COLLECTIONS.PAYMENTS, paymentData);
  }

  static async getPaymentById(id: string): Promise<Payment | null> {
    return FirebaseService.getById<Payment>(COLLECTIONS.PAYMENTS, id);
  }

  static async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return FirebaseService.query<Payment>(
      COLLECTIONS.PAYMENTS,
      [{ field: 'bookingId', operator: '==', value: bookingId }],
      'createdAt',
      'desc'
    );
  }

  static async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return FirebaseService.query<Payment>(
      COLLECTIONS.PAYMENTS,
      [{ field: 'customerEmail', operator: '==', value: userId }]
    );
  }

  static async getAllPayments(): Promise<Payment[]> {
    return FirebaseService.getAll<Payment>(COLLECTIONS.PAYMENTS);
  }

  static async updatePayment(id: string, paymentData: Partial<Payment>): Promise<void> {
    return FirebaseService.update<Payment>(COLLECTIONS.PAYMENTS, id, paymentData);
  }

  static async deletePayment(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.PAYMENTS, id);
  }
}

// Sales Service for tracking sales and analytics
export class SalesService {
  static async createSalesRecord(salesData: Omit<SalesRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return FirebaseService.create<SalesRecord>(COLLECTIONS.SALES, salesData);
  }

  static async getSalesRecordById(id: string): Promise<SalesRecord | null> {
    return FirebaseService.getById<SalesRecord>(COLLECTIONS.SALES, id);
  }

  static async getAllSales(): Promise<SalesRecord[]> {
    return FirebaseService.getAll<SalesRecord>(COLLECTIONS.SALES);
  }

  static async getSalesByDateRange(startDate: string, endDate: string): Promise<SalesRecord[]> {
    return FirebaseService.query<SalesRecord>(
      COLLECTIONS.SALES,
      [
        { field: 'paymentDate', operator: '>=', value: startDate },
        { field: 'paymentDate', operator: '<=', value: endDate }
      ],
      'paymentDate',
      'desc'
    );
  }

  static async getSalesByTour(tourId: string): Promise<SalesRecord[]> {
    return FirebaseService.query<SalesRecord>(
      COLLECTIONS.SALES,
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
    return FirebaseService.getAll<SalesRecord>(COLLECTIONS.SALES);
  }

  static async updateSalesRecord(id: string, salesData: Partial<SalesRecord>): Promise<void> {
    return FirebaseService.update<SalesRecord>(COLLECTIONS.SALES, id, salesData);
  }

  static async deleteSalesRecord(id: string): Promise<void> {
    return FirebaseService.delete(COLLECTIONS.SALES, id);
  }
}

export class DateAvailabilityService {
  static async checkDateAvailability(tourId: string, date: string): Promise<boolean> {
    try {
      const availability = await FirebaseService.query<DateAvailability>(
        COLLECTIONS.DATE_AVAILABILITY,
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
      return false; // Default to unavailable if error
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
    
    return FirebaseService.create<DateAvailability>(COLLECTIONS.DATE_AVAILABILITY, availabilityData);
  }

  static async releaseDate(tourId: string, date: string): Promise<void> {
    try {
      const availability = await FirebaseService.query<DateAvailability>(
        COLLECTIONS.DATE_AVAILABILITY,
        [
          { field: 'tourId', operator: '==', value: tourId },
          { field: 'date', operator: '==', value: date }
        ]
      );
      
      // Delete the availability record to make date available again
      for (const record of availability) {
        if (record.id) {
          await FirebaseService.delete(COLLECTIONS.DATE_AVAILABILITY, record.id);
        }
      }
    } catch (error) {
      console.error('Error releasing date:', error);
    }
  }

  static async getBookedDatesForTour(tourId: string): Promise<DateAvailability[]> {
    return FirebaseService.query<DateAvailability>(
      COLLECTIONS.DATE_AVAILABILITY,
      [
        { field: 'tourId', operator: '==', value: tourId },
        { field: 'status', operator: '==', value: 'booked' }
      ]
    );
  }

  static async getBookedDatesForUser(userId: string): Promise<DateAvailability[]> {
    return FirebaseService.query<DateAvailability>(
      COLLECTIONS.DATE_AVAILABILITY,
      [
        { field: 'userId', operator: '==', value: userId },
        { field: 'status', operator: '==', value: 'booked' }
      ]
    );
  }
}

// Payment Interface for Firestore
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
  // Additional payment tracking
  transactionId?: string;
  gatewayResponse?: any; // Store full PayMongo response
  failureReason?: string;
  processedAt?: string;
  // New fields for partial payment system
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
  commission?: number; // if you have commission tracking
  netAmount: number; // amount after any deductions
  createdAt?: any;
  updatedAt?: any;
}

// Date Availability Interface
export interface DateAvailability {
  id?: string;
  tourId: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  bookingId?: string; // if booked, which booking
  userId?: string; // who booked it
  status: 'available' | 'booked' | 'blocked';
  createdAt?: any;
  updatedAt?: any;
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
        price: 60000, // ₱60,000
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
        price: 90000, // ₱90,000
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
        price: 45000, // ₱45,000
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
        price: 35000, // ₱35,000
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
        price: 75000, // ₱75,000
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        availabilityUntil: '2024-12-31',
        imageUrl: '/assets/new york, usa.jpg',
        isActive: true
      }
    ];

    // Add destinations to Firestore
    console.log('Creating sample destinations...');
    for (const destination of destinations) {
      await DestinationService.createDestination(destination);
    }

    // Add tours to Firestore
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
  private static collectionName = COLLECTIONS.RATINGS;

  /**
   * Create a new rating
   */
  static async createRating(ratingData: Omit<Rating, 'id' | 'createdAt'>): Promise<string> {
    try {
      console.log('Creating rating:', ratingData);
      
      const ratingWithTimestamp = {
        ...ratingData,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), ratingWithTimestamp);
      console.log('Rating created with ID:', docRef.id);
      return docRef.id;
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
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Rating));
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
      const q = query(
        collection(db, this.collectionName),
        where('tourId', '==', tourId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Rating));
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
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Rating));
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
      const q = query(
        collection(db, this.collectionName),
        where('bookingId', '==', bookingId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Rating;
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
      const ratingRef = doc(db, this.collectionName, ratingId);
      await updateDoc(ratingRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
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
      const ratingRef = doc(db, this.collectionName, ratingId);
      await deleteDoc(ratingRef);
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

export { COLLECTIONS };
