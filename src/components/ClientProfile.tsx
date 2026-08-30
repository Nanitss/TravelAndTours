import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, BookingService, Booking, TourService, Tour, RatingService, Rating, PaymentService, Payment } from '../utils/firebaseService';
import { CustomAuthService } from '../utils/customAuth';
import RemainingPaymentModal from './RemainingPaymentModal';
import RatingModal from './RatingModal';
import StarRating from './StarRating';
import TourDetailsModal from './TourDetailsModal';
import './ClientProfile.css';

interface ClientProfileProps {
  currentPage?: string;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ currentPage = 'profile' }) => {
  const { currentUser } = useAuth();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<{[key: string]: Tour}>({});
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(currentPage);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'succeeded' | 'failed' | 'pending' | 'cancelled'>('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'all' | 'initial' | 'remaining' | 'full'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: ''
  });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newArrivalDate: '',
    newDepartureDate: ''
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null);
  const [userRatings, setUserRatings] = useState<{[key: string]: Rating}>({});
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showRemainingPaymentModal, setShowRemainingPaymentModal] = useState(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [showContactHostModal, setShowContactHostModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      console.log('Current user object:', currentUser);
      console.log('User ID:', currentUser.id);
      
      // Initialize display user with current user data
      setDisplayUser(currentUser);
      
      // Initialize edit form with current user data (excluding email)
      setEditForm({
        name: currentUser.name || currentUser.Username || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        gender: currentUser.gender || '',
        dateOfBirth: currentUser.dateOfBirth || ''
      });

      // Load user bookings, ratings, and payments
      loadUserBookings();
      loadUserRatings();
      loadUserPayments();
    }
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(currentPage);
  }, [currentPage]);

  const loadUserBookings = async () => {
    if (!currentUser?.id) {
      console.log('No current user ID found:', currentUser);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading bookings for user ID:', currentUser.id);
      console.log('Current user object:', currentUser);
      
      // First, get all bookings to see what's in the database
      const allBookings = await BookingService.getAllBookings();
      console.log('All bookings in database:', allBookings);
      console.log('All user IDs in bookings:', allBookings.map(b => ({ id: b.id, userId: b.userId, customerEmail: b.customerEmail })));
      
      // Filter bookings by userId first
      let userBookings = allBookings.filter(booking => {
        const matches = booking.userId === currentUser.id;
        console.log(`Booking ${booking.id}: userId=${booking.userId}, currentUser.id=${currentUser.id}, matches=${matches}`);
        return matches;
      });
      
      // If no bookings found by userId, try filtering by email as fallback
      if (userBookings.length === 0) {
        console.log('No bookings found by userId, trying email match...');
        const userEmail = currentUser.email || currentUser.Email;
        console.log('Looking for bookings with email:', userEmail);
        
        userBookings = allBookings.filter(booking => {
          const emailMatches = booking.customerEmail === userEmail;
          console.log(`Booking ${booking.id}: customerEmail=${booking.customerEmail}, userEmail=${userEmail}, matches=${emailMatches}`);
          return emailMatches;
        });
      }
      
      console.log('Final filtered bookings for user:', userBookings);
      setUserBookings(userBookings);
      
      // Fetch tour data for each booking
      await loadTourData(userBookings);
      
      // Also try the query method for comparison
      try {
        const queryBookings = await BookingService.getBookingsByUser(currentUser.id);
        console.log('Query method result:', queryBookings);
      } catch (queryError) {
        console.log('Query method failed:', queryError);
      }
      
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTourData = async (bookings: Booking[]) => {
    try {
      const tourPromises = bookings.map(async (booking) => {
        try {
          const tour = await TourService.getTourById(booking.tourId);
          return { tourId: booking.tourId, tour };
        } catch (error) {
          console.error(`Error fetching tour ${booking.tourId}:`, error);
          return { tourId: booking.tourId, tour: null };
        }
      });

      const tourResults = await Promise.all(tourPromises);
      const toursMap: {[key: string]: Tour} = {};
      
      tourResults.forEach(({ tourId, tour }) => {
        if (tour) {
          toursMap[tourId] = tour;
        }
      });

      setTours(toursMap);
    } catch (error) {
      console.error('Error loading tour data:', error);
    }
  };

  const loadUserRatings = async () => {
    if (!currentUser?.id) return;
    
    try {
      const ratings = await RatingService.getRatingsByUser(currentUser.id);
      const ratingsMap: {[key: string]: Rating} = {};
      
      ratings.forEach(rating => {
        ratingsMap[rating.bookingId] = rating;
      });
      
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error loading user ratings:', error);
    }
  };

  const loadUserPayments = async () => {
    console.log('🚀 loadUserPayments function called');
    if (!currentUser?.id) {
      console.log('❌ No current user ID found');
      return;
    }
    
    try {
      console.log('✅ Loading payments for user:', currentUser.id);
      const userEmail = currentUser.email || currentUser.Email;
      const userName = currentUser.name || currentUser.Username;
      console.log('📧 User email for payment lookup:', userEmail);
      console.log('👤 User name for payment lookup:', userName);
      
      // Get all payments and filter by user email/name in JavaScript
      console.log('🔍 Getting all payments from database...');
      const allPayments = await PaymentService.getAllPayments();
      console.log('All payments in database:', allPayments.length);
      
      // Filter payments by user email
      let payments = allPayments.filter(payment => {
        const emailMatch = userEmail && payment.customerEmail === userEmail;
        const nameMatch = userName && payment.customerName === userName;
        return emailMatch || nameMatch;
      });
      
      console.log('Payments found for user:', payments.length);
      
      // Sort by creation date (newest first)
      payments.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('Final payments to display:', payments);
      setUserPayments(payments);
    } catch (error) {
      console.error('Error loading user payments:', error);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Check if user is logged in
    if (!currentUser?.id) {
      setPasswordError('No user logged in');
      return;
    }

    // Validate new password
    const passwordErrors = validatePassword(passwordForm.newPassword);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors.join('. '));
      return;
    }

    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      // Use custom authentication service to change password
      const result = await CustomAuthService.changePassword(
        currentUser.id,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (result.success) {
        setPasswordSuccess(result.message);
        
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(result.message);
      }

    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  const handleRateTrip = (booking: Booking) => {
    setBookingToRate(booking);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    // Reload ratings after submission
    loadUserRatings();
  };

  const isTripCompleted = (booking: Booking) => {
    const travelDate = new Date(booking.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return travelDate < today;
  };

  const canRateTrip = (booking: Booking) => {
    return isTripCompleted(booking) && booking.status === 'completed' && !userRatings[booking.bookingId];
  };

  const handleViewTourDetails = (booking: Booking) => {
    const tour = tours[booking.tourId];
    if (tour) {
      setSelectedTour(tour);
      setSelectedBookingForDetails(booking);
      setShowTourDetailsModal(true);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear errors when user starts typing
    if (passwordError) setPasswordError('');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    // Update the current user display with edited values (email remains unchanged)
    const updatedUser = {
      ...currentUser,
      name: editForm.name || currentUser?.name || currentUser?.Username || '',
      phone: editForm.phone || currentUser?.phone || '',
      address: editForm.address || currentUser?.address || '',
      gender: editForm.gender || '',
      dateOfBirth: editForm.dateOfBirth || ''
    };

    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update the display user state
    setDisplayUser(updatedUser);
    
    setIsEditing(false);
    
    // Show notification
    setShowNotification(true);
    
    // Hide notification after 2 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values (excluding email)
    setEditForm({
      name: currentUser?.name || currentUser?.Username || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      gender: currentUser?.gender || '',
      dateOfBirth: currentUser?.dateOfBirth || ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getDaysUntilDeparture = (departureDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departure = new Date(departureDate);
    departure.setHours(0, 0, 0, 0);
    const diffTime = departure.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isArrivalDatePassed = (arrivalDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrival = new Date(arrivalDate);
    arrival.setHours(0, 0, 0, 0);
    return arrival < today;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      case 'completed':
        return '#17a2b8';
      case 'voided':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setRescheduleForm({
      newArrivalDate: booking.travelDate,
      newDepartureDate: booking.departureDate || booking.travelDate
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedBooking || !rescheduleForm.newArrivalDate || !rescheduleForm.newDepartureDate) {
      alert('Please select both arrival and departure dates.');
      return;
    }

    try {
      await BookingService.updateBooking(selectedBooking.id!, {
        travelDate: rescheduleForm.newArrivalDate,
        departureDate: rescheduleForm.newDepartureDate,
        hasRescheduled: true,
        updatedAt: new Date()
      });

      // Refresh bookings
      await loadUserBookings();
      
      setShowRescheduleModal(false);
      setSelectedBooking(null);
      setRescheduleForm({ newArrivalDate: '', newDepartureDate: '' });
      
      alert('Your booking has been successfully rescheduled!');
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      alert('Error rescheduling booking. Please try again.');
    }
  };

  const handleRescheduleCancel = () => {
    setShowRescheduleModal(false);
    setSelectedBooking(null);
    setRescheduleForm({ newArrivalDate: '', newDepartureDate: '' });
  };

  const handlePayRemainingClick = (booking: Booking) => {
    setSelectedBookingForPayment(booking);
    setShowRemainingPaymentModal(true);
  };

  const handleContactHostClick = () => {
    setShowContactHostModal(true);
  };

  const handleRemainingPaymentClose = () => {
    setShowRemainingPaymentModal(false);
    setSelectedBookingForPayment(null);
  };

  const handleRemainingPaymentSuccess = () => {
    setShowRemainingPaymentModal(false);
    setSelectedBookingForPayment(null);
    // Refresh bookings to show updated status
    loadUserBookings();
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  if (!currentUser) {
    return (
      <div className="client-profile-container">
        <div className="profile-error">
          <h2>Please log in to view your profile</h2>
          <button 
            className="back-to-home-btn" 
            onClick={() => window.location.reload()}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-profile-container">
      <div className="profile-layout">
        {/* Sidebar Navigation */}
        <div className="profile-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Profile</h3>
            <div className="sidebar-nav">
              <button 
                className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button 
                className={`sidebar-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                Bookings
              </button>
              <button 
                className={`sidebar-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => setActiveTab('payments')}
              >
                Payments
              </button>
              <button 
                className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h1 className="profile-title">My Profile</h1>
              
              <div className="profile-content-compact">
                <div className="profile-header">
                  <div className="profile-picture-section">
                    <div className="profile-picture">
                      <div className="profile-avatar">
                        {displayUser?.name?.charAt(0) || displayUser?.Username?.charAt(0) || 'U'}
                      </div>
                    </div>
                    <button className="change-picture-btn">Change Profile Picture</button>
                  </div>

                  <div className="profile-actions">
                    {isEditing ? (
                      <div className="edit-actions">
                        <button className="save-btn" onClick={handleSaveProfile}>
                          Save Changes
                        </button>
                        <button className="cancel-btn" onClick={handleCancelEdit}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="edit-profile-btn" onClick={handleEditProfile}>
                        Edit Profile Information
                      </button>
                    )}
                  </div>
                </div>

                <div className="profile-details-grid">
                  <div className="profile-field">
                    <label>Username:</label>
                    <span>{displayUser?.name || displayUser?.Username || 'N/A'}</span>
                  </div>
                  
                  <div className="profile-field">
                    <label>Name:</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="profile-input"
                      />
                    ) : (
                      <span>{displayUser?.name || displayUser?.Username || 'N/A'}</span>
                    )}
                  </div>
                  
                  <div className="profile-field email-field">
                    <label>Email:</label>
                    <div className="email-display">
                      <span className="email-value">{displayUser?.email || displayUser?.Email || 'N/A'}</span>
                      <span className="email-lock">🔒</span>
                    </div>
                    <div className="email-note">Email cannot be changed</div>
                  </div>
                  
                  <div className="profile-field">
                    <label>Phone number:</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="profile-input"
                      />
                    ) : (
                      <span>{displayUser?.phone || 'Not provided'}</span>
                    )}
                  </div>
                  
                  <div className="profile-field">
                    <label>Address:</label>
                    {isEditing ? (
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        className="profile-textarea"
                        rows={2}
                      />
                    ) : (
                      <span>{displayUser?.address || 'Not provided'}</span>
                    )}
                  </div>

                  <div className="profile-field">
                    <label>Gender:</label>
                    {isEditing ? (
                      <div className="gender-options">
                        <label className="gender-option">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={editForm.gender === 'female'}
                            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                          />
                          Female
                        </label>
                        <label className="gender-option">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={editForm.gender === 'male'}
                            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                          />
                          Male
                        </label>
                        <label className="gender-option">
                          <input
                            type="radio"
                            name="gender"
                            value="prefer-not-to-say"
                            checked={editForm.gender === 'prefer-not-to-say'}
                            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                          />
                          Prefer not to say
                        </label>
                      </div>
                    ) : (
                      <span>{displayUser?.gender || 'Not specified'}</span>
                    )}
                  </div>

                  <div className="profile-field">
                    <label>Date of Birth:</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="profile-input"
                      />
                    ) : (
                      <span>{displayUser?.dateOfBirth || 'Not provided'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <div className="bookings-header">
                <h1 className="bookings-title">My Bookings</h1>
                <button 
                  className="refresh-btn" 
                  onClick={() => loadUserBookings()}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
              </div>
              
              {loading ? (
                <div className="loading">Loading bookings...</div>
              ) : userBookings.length === 0 ? (
                <div className="no-bookings">
                  <div className="no-bookings-icon">📋</div>
                  <h3>No Bookings Yet</h3>
                  <p>You haven't made any bookings yet. Start exploring amazing destinations!</p>
                  <div className="debug-info">
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {currentUser?.id || 'No ID'}</p>
                    <p>User Email: {currentUser?.email || currentUser?.Email || 'No Email'}</p>
                    <p>Bookings found: {userBookings.length}</p>
                    <button 
                      className="debug-btn" 
                      onClick={async () => {
                        try {
                          console.log('Testing getAllBookings...');
                          const allBookings = await BookingService.getAllBookings();
                          console.log('All bookings in database:', allBookings);
                          
                          // Check if any bookings have the current user's ID
                          const userBookingsById = allBookings.filter(booking => 
                            booking.userId === currentUser?.id
                          );
                          
                          // Check if any bookings have the current user's email
                          const userEmail = currentUser?.email || currentUser?.Email;
                          const userBookingsByEmail = allBookings.filter(booking => 
                            booking.customerEmail === userEmail
                          );
                          
                          console.log('Bookings for current user by ID:', userBookingsById);
                          console.log('Bookings for current user by email:', userBookingsByEmail);
                          console.log('Current user ID:', currentUser?.id);
                          console.log('Current user email:', userEmail);
                          console.log('All user IDs in bookings:', allBookings.map(b => b.userId));
                          console.log('All customer emails in bookings:', allBookings.map(b => b.customerEmail));
                          
                          alert(`Found ${allBookings.length} total bookings in database.\n${userBookingsById.length} match by user ID.\n${userBookingsByEmail.length} match by email.`);
                          
                          // Test the query method directly
                          if (currentUser?.id) {
                            console.log('Testing getBookingsByUser query...');
                            const queryResult = await BookingService.getBookingsByUser(currentUser.id);
                            console.log('Query result:', queryResult);
                            alert(`Query method returned ${queryResult.length} bookings for user ${currentUser.id}`);
                          }
                        } catch (error) {
                          console.error('Error getting all bookings:', error);
                          alert('Error getting all bookings: ' + error);
                        }
                      }}
                    >
                      Test Database Connection
                    </button>
                  </div>
                  <button 
                    className="debug-btn" 
                    onClick={() => loadUserBookings()}
                    style={{ marginRight: '10px' }}
                  >
                    Refresh Bookings
                  </button>
                  <button className="book-now-btn" onClick={() => window.location.reload()}>
                    Browse Tours
                  </button>
                </div>
              ) : (
                <div className="bookings-list">
                  <div className="bookings-header">
                    <div className="header-left">
                      <h3>Your Bookings ({userBookings.length})</h3>
                    </div>
                    <div className="header-right">
                      <select 
                        className="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed')}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div className="bookings-table-container">
                    <table className="bookings-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Package</th>
                          <th>Participants</th>
                          <th>Status</th>
                          <th>Total Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userBookings
                          .filter(booking => statusFilter === 'all' || booking.status === statusFilter)
                          .sort((a, b) => {
                            // Sort by bookingDate (latest first)
                            const dateA = a.bookingDate ? new Date(a.bookingDate) : new Date(0);
                            const dateB = b.bookingDate ? new Date(b.bookingDate) : new Date(0);
                            return dateB.getTime() - dateA.getTime();
                          })
                          .map((booking) => (
                          <tr key={booking.id} className={booking.status}>
                            <td>
                              <div className="booking-dates">
                                <div>Arrival: {formatDate(booking.travelDate)}</div>
                                {booking.departureDate && (
                                  <div>Departure: {formatDate(booking.departureDate)}</div>
                                )}
                              </div>
                            </td>
                            <td>{booking.tourTitle}</td>
                            <td>{booking.participants}</td>
                            <td>
                              <div className="status-container">
                                <div className="status-badges">
                                  <span 
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(booking.status) }}
                                  >
                                    {(() => {
                                      // Check if booking should be voided due to passed arrival date
                                      if (booking.paymentType === 'partial' && 
                                          booking.amountRemaining > 0 && 
                                          isArrivalDatePassed(booking.travelDate)) {
                                        return 'VOIDED';
                                      }
                                      return booking.status.toUpperCase();
                                    })()}
                                  </span>
                                  {booking.paymentType === 'partial' && (
                                    <span className="payment-status-badge">
                                      50% PAID
                                    </span>
                                  )}
                                  {booking.hasRescheduled && (
                                    <div className="rescheduled-tag">Rescheduled</div>
                                  )}
                                </div>
                                {(() => {
                                  // Show voided warning if arrival date has passed and payment is incomplete
                                  if (booking.paymentType === 'partial' && 
                                      booking.amountRemaining > 0 && 
                                      isArrivalDatePassed(booking.travelDate)) {
                                    return (
                                      <div className="payment-warning urgent">
                                        <span className="warning-icon">❌</span>
                                        <div className="warning-details">
                                          <div>Booking has been VOIDED</div>
                                          <div className="time-remaining">
                                            Arrival date has passed with incomplete payment
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  // Show payment warning if arrival date is approaching
                                  if (booking.paymentType === 'partial' && 
                                      booking.amountRemaining > 0 && 
                                      !booking.isVoided) {
                                    const daysUntilArrival = getDaysUntilDeparture(booking.travelDate);
                                    if (daysUntilArrival <= 3) {
                                      return (
                                        <div className={`payment-warning ${daysUntilArrival <= 2 ? 'urgent' : ''}`}>
                                          <span className="warning-icon">⚠️</span>
                                          <div className="warning-details">
                                            <div>Remaining Balance: {formatCurrency(booking.amountRemaining)}</div>
                                            <div className="time-remaining">
                                              {daysUntilArrival === 0 
                                                ? "Due today!" 
                                                : daysUntilArrival === 1 
                                                  ? "Due tomorrow!" 
                                                  : `${daysUntilArrival} days until arrival`
                                              }
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  }
                                  
                                  return null;
                                })()}
                              </div>
                            </td>
                            <td>{formatCurrency(booking.totalPrice)}</td>
                            <td>
                              <div className="table-actions">
                                <button 
                                  className="view-details-btn"
                                  onClick={() => handleViewTourDetails(booking)}
                                >
                                  View Details
                                </button>
                                <div className="action-dropdown">
                                  <button className="action-menu-btn">•••</button>
                                  <div className="action-menu">
                                    <button onClick={handleContactHostClick}>
                                      Contact Host
                                    </button>
                                    {!booking.hasRescheduled && (
                                      <button onClick={() => handleRescheduleClick(booking)}>
                                        Reschedule
                                      </button>
                                    )}
                                    {booking.paymentType === 'partial' && 
                                     booking.amountRemaining > 0 && 
                                     !isArrivalDatePassed(booking.travelDate) && (
                                      <button onClick={() => handlePayRemainingClick(booking)}>
                                        Pay Balance
                                      </button>
                                    )}
                                    {canRateTrip(booking) && (
                                      <button onClick={() => handleRateTrip(booking)}>
                                        Rate Trip
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="payments-section">
              <div className="payments-header">
                <h1 className="payments-title">Payment Records</h1>
                <div className="header-buttons">
                  <button 
                    className="debug-btn" 
                    onClick={() => {
                      console.log('🔧 Manual debug button clicked');
                      loadUserPayments();
                    }}
                    style={{ marginRight: '10px', backgroundColor: '#ffc107', color: '#000' }}
                  >
                    🔧 Debug Payments
                  </button>
                  <button 
                    className="refresh-btn" 
                    onClick={() => loadUserPayments()}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : '🔄 Refresh'}
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading">Loading payments...</div>
              ) : userPayments.length === 0 ? (
                <div className="no-payments">
                  <div className="no-payments-icon">💳</div>
                  <h3>No Payment Records</h3>
                  <p>You haven't made any payments yet. Your payment history will appear here after you complete a booking.</p>
                </div>
              ) : (
                <div className="payments-list">
                  <div className="payments-filters">
                    <div className="filter-group">
                      <label>Payment Status:</label>
                      <select 
                        className="filter-select"
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value as 'all' | 'succeeded' | 'failed' | 'pending' | 'cancelled')}
                      >
                        <option value="all">All Status</option>
                        <option value="succeeded">Succeeded</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Payment Type:</label>
                      <select 
                        className="filter-select"
                        value={paymentTypeFilter}
                        onChange={(e) => setPaymentTypeFilter(e.target.value as 'all' | 'initial' | 'remaining' | 'full')}
                      >
                        <option value="all">All Types</option>
                        <option value="initial">Initial Payment</option>
                        <option value="remaining">Remaining Payment</option>
                        <option value="full">Full Payment</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="payments-table-container">
                    <table className="payments-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Booking ID</th>
                          <th>Amount</th>
                          <th>Payment Method</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userPayments
                          .filter(payment => {
                            const statusMatch = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;
                            const typeMatch = paymentTypeFilter === 'all' || payment.paymentType === paymentTypeFilter;
                            return statusMatch && typeMatch;
                          })
                          .sort((a, b) => {
                            // Sort by createdAt (latest first)
                            const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                            const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                            return dateB.getTime() - dateA.getTime();
                          })
                          .map((payment) => (
                          <tr key={payment.id} className={`payment-row ${payment.status}`}>
                            <td>
                              <div className="transaction-id">
                                {payment.transactionId || payment.paymentIntentId}
                              </div>
                            </td>
                            <td>
                              <div className="booking-id">
                                {payment.bookingId}
                              </div>
                            </td>
                            <td>
                              <div className="payment-amount">
                                {formatCurrency(payment.amount)}
                                {payment.paymentType === 'remaining' && (
                                  <div className="payment-details">
                                    <small>Remaining: {formatCurrency(payment.amountRemaining || 0)}</small>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="payment-method">
                                <span className="method-icon">
                                  {payment.paymentMethod === 'gcash' ? '📱' : 
                                   payment.paymentMethod === 'grab_pay' ? '🚗' : 
                                   payment.paymentMethod === 'paymaya' ? '💳' : '💳'}
                                </span>
                                <span className="method-name">
                                  {payment.paymentMethod === 'gcash' ? 'GCash' : 
                                   payment.paymentMethod === 'grab_pay' ? 'GrabPay' : 
                                   payment.paymentMethod === 'paymaya' ? 'PayMaya' : 
                                   payment.paymentMethod}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="payment-type">
                                <span className={`type-badge ${payment.paymentType}`}>
                                  {payment.paymentType === 'initial' ? 'Initial' :
                                   payment.paymentType === 'remaining' ? 'Remaining' :
                                   payment.paymentType === 'full' ? 'Full' : 'Unknown'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="payment-status">
                                <span 
                                  className={`status-badge ${payment.status}`}
                                  style={{ 
                                    backgroundColor: payment.status === 'succeeded' ? '#28a745' :
                                                   payment.status === 'failed' ? '#dc3545' :
                                                   payment.status === 'pending' ? '#ffc107' :
                                                   payment.status === 'cancelled' ? '#6c757d' : '#6c757d'
                                  }}
                                >
                                  {payment.status.toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="payment-date">
                                {payment.processedAt ? 
                                  formatDate(payment.processedAt) : 
                                  payment.createdAt ? 
                                    formatDate(new Date(payment.createdAt.seconds * 1000).toISOString()) :
                                    'N/A'
                                }
                              </div>
                            </td>
                            <td>
                              <div className="payment-actions">
                                <button 
                                  className="view-details-btn"
                                  onClick={() => {
                                    // For now, just show an alert with payment details
                                    alert(`Payment Details:\n\nTransaction ID: ${payment.transactionId || payment.paymentIntentId}\nBooking ID: ${payment.bookingId}\nAmount: ${formatCurrency(payment.amount)}\nStatus: ${payment.status}\nMethod: ${payment.paymentMethod}\nType: ${payment.paymentType}\nDate: ${payment.processedAt || 'N/A'}`);
                                  }}
                                >
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h1 className="settings-title">Settings</h1>
              <div className="settings-content">
                <div className="settings-group">
                  <h3>Account Settings</h3>
                  <div className="settings-item">
                    <label>Change Password</label>
                    <button 
                      className="settings-btn"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </button>
                  </div>
                  <div className="settings-item">
                    <label>Email Notifications</label>
                    <button className="settings-btn">Manage Notifications</button>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Privacy Settings</h3>
                  <div className="settings-item">
                    <label>Profile Visibility</label>
                    <button className="settings-btn">Manage Privacy</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Confirmation Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="modal-overlay" onClick={handleRescheduleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Full width at top */}
            <div className="modal-header">
              <div className="modal-header-icon">📅</div>
              <div className="modal-header-content">
                <h2>Reschedule Booking</h2>
                <p className="modal-header-subtitle">Update your travel dates</p>
              </div>
              <button className="modal-close" onClick={handleRescheduleCancel}>×</button>
            </div>

            {/* Modal Body - Main content area */}
            <div className="modal-body">
              <div className="reschedule-warning">
                <div className="reschedule-warning-content">
                  <h3>One-time reschedule only</h3>
                  <p>You can only reschedule your booking <strong>ONCE</strong>. After this reschedule, you will not be able to change your dates again.</p>
                </div>
              </div>

              <div className="current-booking-info">
                <h4>Current Booking Details</h4>
                <p><strong>Package:</strong> {selectedBooking.tourTitle}</p>
                <p><strong>Current Arrival:</strong> {formatDate(selectedBooking.travelDate)}</p>
                {selectedBooking.departureDate && (
                  <p><strong>Current Departure:</strong> {formatDate(selectedBooking.departureDate)}</p>
                )}
              </div>

              <div className="reschedule-form">
                <div className="form-group">
                  <label htmlFor="newArrivalDate">New Arrival Date</label>
                  <input
                    type="date"
                    id="newArrivalDate"
                    value={rescheduleForm.newArrivalDate}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, newArrivalDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newDepartureDate">New Departure Date</label>
                  <input
                    type="date"
                    id="newDepartureDate"
                    value={rescheduleForm.newDepartureDate}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, newDepartureDate: e.target.value})}
                    min={rescheduleForm.newArrivalDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer - Full width at bottom */}
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleRescheduleCancel}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleRescheduleConfirm}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-icon">🔐</div>
              <div className="modal-header-content">
                <h2>Change Password</h2>
                <p className="modal-header-subtitle">Update your account password</p>
              </div>
              <button className="modal-close" onClick={() => setShowChangePasswordModal(false)}>×</button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your current password"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your new password"
                    className="form-input"
                    required
                  />
                  <div className="password-requirements">
                    <p>Password must contain:</p>
                    <ul>
                      <li className={passwordForm.newPassword.length >= 8 ? 'valid' : 'invalid'}>
                        At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'valid' : 'invalid'}>
                        One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(passwordForm.newPassword) ? 'valid' : 'invalid'}>
                        One lowercase letter
                      </li>
                      <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword) ? 'valid' : 'invalid'}>
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm your new password"
                    className="form-input"
                    required
                  />
                </div>

                {passwordError && <div className="error-message">{passwordError}</div>}
                {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleChangePassword}
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showNotification && (
        <div className="notification-overlay">
          <div className="notification">
            <div className="notification-icon">✅</div>
            <div className="notification-message">Profile updated successfully</div>
          </div>
        </div>
      )}

      {/* Remaining Payment Modal */}
      {showRemainingPaymentModal && selectedBookingForPayment && (
        <RemainingPaymentModal
          isOpen={showRemainingPaymentModal}
          onClose={handleRemainingPaymentClose}
          booking={{
            id: selectedBookingForPayment.tourId,
            bookingId: selectedBookingForPayment.bookingId,
            tourTitle: selectedBookingForPayment.tourTitle,
            totalPrice: selectedBookingForPayment.totalPrice,
            amountPaid: selectedBookingForPayment.amountPaid || 0,
            amountRemaining: selectedBookingForPayment.amountRemaining || 0,
            dueDate: selectedBookingForPayment.dueDate || '',
            paymentMethod: selectedBookingForPayment.paymentMethod || 'gcash',
            userId: selectedBookingForPayment.userId,
            customerName: selectedBookingForPayment.customerName,
            customerEmail: selectedBookingForPayment.customerEmail
          }}
          onPaymentSuccess={handleRemainingPaymentSuccess}
        />
      )}

      {/* Contact Host Modal */}
      {showContactHostModal && (
        <div className="modal-overlay" onClick={() => setShowContactHostModal(false)}>
          <div className="modal-content contact-host-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Host</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowContactHostModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-info">
                <div className="host-avatar">
                  <div className="avatar-icon">👨‍💼</div>
                </div>
                <div className="host-details">
                  <h3>Mark Maeda</h3>
                  <p className="host-title">Travel & Tours Host</p>
                </div>
              </div>
              
              <div className="contact-methods">
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-info-item">
                    <span className="contact-label">Phone</span>
                    <a href="tel:09605877964" className="contact-value">09605877964</a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📧</div>
                  <div className="contact-info-item">
                    <span className="contact-label">Email</span>
                    <a href="mailto:Markmaedatours@gmail.com" className="contact-value">Markmaedatours@gmail.com</a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">📘</div>
                  <div className="contact-info-item">
                    <span className="contact-label">Facebook</span>
                    <a 
                      href="https://www.facebook.com/markmaedatravelandtours/about_overview" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-value"
                    >
                      Mark Maeda Travel & Tours
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="response-time-notice">
                <div className="notice-icon">⏰</div>
                <div className="notice-text">
                  <strong>Response Time:</strong> Inquiries would be processed within 3-5 Business Days.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="close-modal-btn"
                onClick={() => setShowContactHostModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {bookingToRate && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setBookingToRate(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
          bookingData={{
            bookingId: bookingToRate.bookingId,
            tourId: bookingToRate.tourId,
            tourTitle: bookingToRate.tourTitle,
            travelDate: bookingToRate.travelDate
          }}
          userData={{
            userId: currentUser?.id || '',
            customerName: currentUser?.name || currentUser?.Username || '',
            customerEmail: currentUser?.email || currentUser?.Email || ''
          }}
        />
      )}

      {/* Tour Details Modal */}
      <TourDetailsModal
        isOpen={showTourDetailsModal}
        onClose={() => {
          setShowTourDetailsModal(false);
          setSelectedTour(null);
          setSelectedBookingForDetails(null);
        }}
        tour={selectedTour}
        bookingInfo={selectedBookingForDetails ? {
          participants: selectedBookingForDetails.participants,
          travelDate: selectedBookingForDetails.travelDate,
          departureDate: selectedBookingForDetails.departureDate,
          totalPrice: selectedBookingForDetails.totalPrice
        } : undefined}
      />
    </div>
  );
};

export default ClientProfile;
