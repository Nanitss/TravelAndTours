import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Tour, TourService, BookingService, ActivityService, DateAvailabilityService } from '../utils/supabaseService';
import ComprehensiveBookingModal from './ComprehensiveBookingModal';
import './BookingPage.css';

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


interface BookingPageProps {
  selectedTourId?: string | null;
}

const BookingPage: React.FC<BookingPageProps> = ({ selectedTourId }) => {
  const { currentUser } = useAuth();
  const [packages, setPackages] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [viewingPackage, setViewingPackage] = useState<Tour | null>(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [userBookedDates, setUserBookedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPackages();
    loadUserBookings();
  }, [currentUser]);

  // Pre-select tour if selectedTourId is provided
  useEffect(() => {
    if (selectedTourId && packages.length > 0) {
      const tour = packages.find(pkg => pkg.id === selectedTourId);
      if (tour) {
        setSelectedPackage(selectedTourId);
        // Load booked dates for the selected tour
        loadBookedDates(selectedTourId);
        // Scroll to the selected package
        setTimeout(() => {
          const element = document.getElementById(`package-${selectedTourId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [selectedTourId, packages]);

  // Load booked dates when a package is selected
  useEffect(() => {
    if (selectedPackage) {
      loadBookedDates(selectedPackage);
    } else {
      setBookedDates(new Set());
    }
  }, [selectedPackage]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading packages from database...');
      const allPackages = await TourService.getAllTours();
      console.log('📦 All packages from database:', allPackages);
      
      // Filter active packages that are still available
      const today = new Date().toISOString().split('T')[0];
      console.log('📅 Today\'s date:', today);
      
      const availablePackages = allPackages.filter(pkg => {
        const isActive = pkg.isActive;
        const isAvailable = pkg.availabilityUntil >= today;
        console.log(`📋 Package "${pkg.title}": isActive=${isActive}, availabilityUntil=${pkg.availabilityUntil}, isAvailable=${isAvailable}`);
        return isActive && isAvailable;
      });
      
      console.log('✅ Available packages after filtering:', availablePackages);
      setPackages(availablePackages);
    } catch (error) {
      console.error('❌ Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookedDates = async (tourId: string) => {
    try {
      console.log('🔄 Loading booked dates for tour:', tourId);
      
      // Get all bookings for this tour from the bookings collection
      const tourBookings = await BookingService.getBookingsByTour(tourId);
      const datesSet = new Set<string>();
      
      tourBookings.forEach(booking => {
        // Add travel date if it exists
        if (booking.travelDate) {
          datesSet.add(booking.travelDate);
        }
        // Add departure date if different from travel date
        if (booking.departureDate && booking.departureDate !== booking.travelDate) {
          datesSet.add(booking.departureDate);
        }
      });
      
      console.log('📅 Booked dates found from bookings collection:', Array.from(datesSet));
      setBookedDates(datesSet);
    } catch (error) {
      console.error('❌ Error loading booked dates:', error);
      setBookedDates(new Set()); // Reset to empty set on error
    }
  };

  const loadUserBookings = async () => {
    if (!currentUser || !currentUser.id) return;
    
    try {
      console.log('🔄 Loading user bookings for user:', currentUser.id);
      
      const userBookings = await BookingService.getBookingsByUser(currentUser.id);
      const userDatesSet = new Set<string>();
      
      userBookings.forEach(booking => {
        // Add travel date
        if (booking.travelDate) {
          userDatesSet.add(booking.travelDate);
        }
        // Add departure date if different
        if (booking.departureDate && booking.departureDate !== booking.travelDate) {
          userDatesSet.add(booking.departureDate);
        }
      });
      
      console.log('📅 User booked dates found from bookings collection:', Array.from(userDatesSet));
      setUserBookedDates(userDatesSet);
    } catch (error) {
      console.error('❌ Error loading user bookings:', error);
      setUserBookedDates(new Set());
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPrice = true;
    if (priceFilter === 'low') matchesPrice = pkg.price < 30000;
    else if (priceFilter === 'medium') matchesPrice = pkg.price >= 30000 && pkg.price < 50000;
    else if (priceFilter === 'high') matchesPrice = pkg.price >= 50000;
    
    return matchesSearch && matchesPrice;
  });

  console.log('🔍 Current packages state:', packages);
  console.log('🔍 Current filteredPackages:', filteredPackages);
  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Price filter:', priceFilter);

  const handlePackageClick = (pkg: Tour) => {
    setViewingPackage(pkg);
  };

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackage(pkgId);
    setViewingPackage(null); // Close the detail view
  };

  const isDateDisabled = (date: string) => {
    if (!date) return false;
    return bookedDates.has(date) || userBookedDates.has(date);
  };


  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    return today.toISOString().split('T')[0];
  };

  const handleCloseDetailView = () => {
    setViewingPackage(null);
  };

  const handleBookNow = async () => {
    if (!selectedPackage || !arrivalDate || !departureDate) {
      alert('Please select a package and fill in all required fields.');
      return;
    }

    const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPackageData) {
      alert('Selected package not found.');
      return;
    }

    // Check if selected dates are disabled
    if (isDateDisabled(arrivalDate)) {
      setAvailabilityError(`The arrival date ${arrivalDate} is already booked. Please choose a different date.`);
      return;
    }

    if (isDateDisabled(departureDate)) {
      setAvailabilityError(`The departure date ${departureDate} is already booked. Please choose a different date.`);
      return;
    }

    // Check date availability from database
    setIsCheckingAvailability(true);
    setAvailabilityError('');

    try {
      console.log('🔍 Checking date availability for:', {
        tourId: selectedPackageData.id,
        arrivalDate,
        departureDate
      });

      // Check if arrival date is available
      const isArrivalDateAvailable = await DateAvailabilityService.checkDateAvailability(
        selectedPackageData.id!,
        arrivalDate
      );

      if (!isArrivalDateAvailable) {
        setAvailabilityError(`The arrival date ${arrivalDate} is already booked. Please choose a different date.`);
        setIsCheckingAvailability(false);
        return;
      }

      // Check if departure date is available (if different from arrival)
      if (departureDate !== arrivalDate) {
        const isDepartureDateAvailable = await DateAvailabilityService.checkDateAvailability(
          selectedPackageData.id!,
          departureDate
        );

        if (!isDepartureDateAvailable) {
          setAvailabilityError(`The departure date ${departureDate} is already booked. Please choose a different date.`);
          setIsCheckingAvailability(false);
          return;
        }
      }

      console.log('✅ Date availability confirmed');

      const bookingData: BookingData = {
        packageId: selectedPackageData.id!,
        packageName: selectedPackageData.title,
        packagePrice: selectedPackageData.price,
        packageImage: selectedPackageData.imageUrl,
        packageDescription: selectedPackageData.description,
        packageHighlights: selectedPackageData.highlights,
        packageIncluded: selectedPackageData.included,
        packageItinerary: selectedPackageData.itinerary,
        packageDuration: selectedPackageData.duration,
        packageDestination: selectedPackageData.destination,
        arrivalDate,
        departureDate,
        passengers
      };
      
      setShowConfirmation(true);
    } catch (error) {
      console.error('❌ Error checking date availability:', error);
      setAvailabilityError('Error checking date availability. Please try again.');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Redirect to login if not authenticated
  if (!currentUser) {
    return (
      <div className="booking-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to access the booking page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-hero">
        <div className="booking-content">
          <div className="booking-text">
            <h1 className="booking-title">Book Your Dream Trip</h1>
            <p className="booking-description">
              Select your destination, choose your dates, and let us handle the rest. 
              Your perfect adventure awaits!
            </p>
          </div>
        </div>
      </div>

      <div className="booking-section">
        <div className="container">
          <div className="booking-form-container">
            <div className="form-card">
              <h2 className="form-title">Select Your Package</h2>
              
              {/* Search and Filter */}
              <div className="search-filter-container">
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                  className="filter-select"
                >
                  <option value="all">All Prices</option>
                  <option value="low">Under ₱30,000</option>
                  <option value="medium">₱30,000 - ₱50,000</option>
                  <option value="high">Over ₱50,000</option>
                </select>
              </div>

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading packages...</p>
                </div>
              ) : (
                <div className="package-selection">
                  {filteredPackages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      id={`package-${pkg.id}`}
                      className={`package-card ${selectedPackage === pkg.id ? 'selected' : ''}`}
                      onClick={() => handlePackageClick(pkg)}
                    >
                      <div className="package-image">
                        <img 
                          src={pkg.imageUrl || '/assets/default-package.jpg'} 
                          alt={pkg.title}
                        />
                        <div className="package-title">
                          <h3>{pkg.duration} Days in {pkg.destination}</h3>
                        </div>
                      </div>
                      <div className="package-content">
                        <p className="package-description">{pkg.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPackages.length === 0 && (
                    <div className="no-packages">
                      <p>No packages found matching your criteria.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Package Detail Modal */}
              {viewingPackage && (
                <div className="package-detail-modal">
                  <div className="package-detail-content">
                    <div className="package-detail-header">
                      <h2>{viewingPackage.title}</h2>
                      <button className="close-detail-btn" onClick={handleCloseDetailView}>×</button>
                    </div>
                    
                    <div className="package-detail-body">
                      <div className="package-detail-image">
                        <img 
                          src={viewingPackage.imageUrl || '/assets/default-package.jpg'} 
                          alt={viewingPackage.title}
                        />
                      </div>
                      
                      <div className="package-detail-info">
                        <div className="package-detail-meta">
                          <span className="destination">📍 {viewingPackage.destination}</span>
                          <span className="duration">⏱️ {viewingPackage.duration} days</span>
                          <span className="price">💰 ₱{viewingPackage.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="package-detail-description">
                          <h3>Description</h3>
                          <p>{viewingPackage.description}</p>
                        </div>
                        
                        {viewingPackage.highlights && viewingPackage.highlights.length > 0 && (
                          <div className="package-detail-highlights">
                            <h3>Highlights</h3>
                            <ul>
                              {viewingPackage.highlights.map((highlight, index) => (
                                <li key={index}>{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {viewingPackage.included && viewingPackage.included.length > 0 && (
                          <div className="package-detail-included">
                            <h3>What's Included</h3>
                            <ul>
                              {viewingPackage.included.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {viewingPackage.itinerary && viewingPackage.itinerary.length > 0 && (
                          <div className="package-detail-itinerary">
                            <h3>Itinerary</h3>
                            <ul>
                              {viewingPackage.itinerary.map((day, index) => (
                                <li key={index}>{day}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="package-detail-footer">
                      <button 
                        className="select-package-btn"
                        onClick={() => handleSelectPackage(viewingPackage.id!)}
                      >
                        Select This Package
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="booking-details">
                <h3 className="details-title">Booking Details</h3>
                
                <div className="input-row">
                  <div className="input-group">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="form-input"
                      placeholder="Arrival Date"
                      min={getMinDate()}
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="form-input"
                      placeholder="Departure Date"
                      min={getMinDate()}
                    />
                  </div>
                  <div className="input-group">
                    <span className="input-icon">👥</span>
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                      className="form-input"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="book-now-container">
                  <button 
                    className="book-now-btn" 
                    onClick={handleBookNow}
                    disabled={isCheckingAvailability}
                  >
                    <span>{isCheckingAvailability ? 'Checking Availability...' : 'Book Now'}</span>
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
                
                {availabilityError && (
                  <div className="availability-error">
                    <span className="error-icon">⚠️</span>
                    <span>{availabilityError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ComprehensiveBookingModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        bookingData={selectedPackage ? {
          packageId: selectedPackage,
          packageName: packages.find(pkg => pkg.id === selectedPackage)?.title || '',
          packagePrice: packages.find(pkg => pkg.id === selectedPackage)?.price || 0,
          packageImage: packages.find(pkg => pkg.id === selectedPackage)?.imageUrl,
          packageDescription: packages.find(pkg => pkg.id === selectedPackage)?.description,
          packageHighlights: packages.find(pkg => pkg.id === selectedPackage)?.highlights,
          packageIncluded: packages.find(pkg => pkg.id === selectedPackage)?.included,
          packageItinerary: packages.find(pkg => pkg.id === selectedPackage)?.itinerary,
          packageDuration: packages.find(pkg => pkg.id === selectedPackage)?.duration,
          packageDestination: packages.find(pkg => pkg.id === selectedPackage)?.destination,
          arrivalDate,
          departureDate,
          passengers
        } : null}
      />
    </div>
  );
};

export default BookingPage;
