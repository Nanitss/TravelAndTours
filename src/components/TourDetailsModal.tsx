import React from 'react';
import { Tour } from '../utils/supabaseService';
import './TourDetailsModal.css';

interface TourDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
  bookingInfo?: {
    participants: number;
    travelDate: string;
    departureDate?: string;
    totalPrice: number;
  };
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({
  isOpen,
  onClose,
  tour,
  bookingInfo
}) => {
  if (!isOpen || !tour) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="tour-details-overlay" onClick={onClose}>
      <div className="tour-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tour-details-header">
          <h2>Tour Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tour-details-content">
          {/* Tour Image */}
          <div className="tour-image-section">
            {tour.imageUrl ? (
              <img 
                src={tour.imageUrl} 
                alt={tour.title}
                className="tour-details-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`image-placeholder ${tour.imageUrl ? 'hidden' : ''}`}>
              <span className="placeholder-icon">🏖️</span>
            </div>
          </div>

          {/* Tour Basic Info */}
          <div className="tour-basic-info">
            <h3 className="tour-title">{tour.title}</h3>
            <div className="tour-location">
              <span className="location-icon">📍</span>
              <span>{tour.destination}</span>
            </div>
            <p className="tour-description">{tour.description}</p>
          </div>

          {/* Tour Details Grid */}
          <div className="tour-details-grid">
            <div className="detail-card">
              <div className="detail-icon">⏱️</div>
              <div className="detail-content">
                <div className="detail-label">Duration</div>
                <div className="detail-value">{tour.duration} days</div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">👥</div>
              <div className="detail-content">
                <div className="detail-label">Max Participants</div>
                <div className="detail-value">{tour.maxParticipants} people</div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">💰</div>
              <div className="detail-content">
                <div className="detail-label">Price per Person</div>
                <div className="detail-value">{formatCurrency(tour.price)}</div>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">📅</div>
              <div className="detail-content">
                <div className="detail-label">Tour Dates</div>
                <div className="detail-value">
                  {formatDate(tour.startDate)} - {formatDate(tour.endDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          {bookingInfo && (
            <div className="booking-info-section">
              <h4>Your Booking Details</h4>
              <div className="booking-details">
                <div className="booking-detail-item">
                  <span className="booking-label">Participants:</span>
                  <span className="booking-value">{bookingInfo.participants} {bookingInfo.participants === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="booking-detail-item">
                  <span className="booking-label">Travel Date:</span>
                  <span className="booking-value">{formatDate(bookingInfo.travelDate)}</span>
                </div>
                {bookingInfo.departureDate && (
                  <div className="booking-detail-item">
                    <span className="booking-label">Departure Date:</span>
                    <span className="booking-value">{formatDate(bookingInfo.departureDate)}</span>
                  </div>
                )}
                <div className="booking-detail-item total-price">
                  <span className="booking-label">Total Price:</span>
                  <span className="booking-value">{formatCurrency(bookingInfo.totalPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tour Highlights */}
          {tour.highlights && tour.highlights.length > 0 && (
            <div className="tour-section">
              <h4>🌟 Tour Highlights</h4>
              <ul className="highlights-list">
                {tour.highlights.map((highlight, index) => (
                  <li key={index} className="highlight-item">
                    <span className="highlight-icon">✨</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What's Included */}
          {tour.included && tour.included.length > 0 && (
            <div className="tour-section">
              <h4>✅ What's Included</h4>
              <ul className="included-list">
                {tour.included.map((item, index) => (
                  <li key={index} className="included-item">
                    <span className="included-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Itinerary */}
          {tour.itinerary && tour.itinerary.length > 0 && (
            <div className="tour-section">
              <h4>🗓️ Daily Itinerary</h4>
              <div className="itinerary-list">
                {tour.itinerary.map((day, index) => (
                  <div key={index} className="itinerary-item">
                    <div className="day-number">Day {index + 1}</div>
                    <div className="day-content">{day}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tour Status */}
          <div className="tour-status-section">
            <div className="status-info">
              <span className="status-label">Tour Status:</span>
              <span className={`status-badge ${tour.isActive ? 'active' : 'inactive'}`}>
                {tour.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="availability-info">
              <span className="availability-label">Available until:</span>
              <span className="availability-value">{formatDate(tour.availabilityUntil)}</span>
            </div>
          </div>
        </div>

        <div className="tour-details-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourDetailsModal;
