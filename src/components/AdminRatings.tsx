import React, { useState, useEffect } from 'react';
import { RatingService, Rating } from '../utils/supabaseService';
import StarRating from './StarRating';
import './AdminRatings.css';

const AdminRatings: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    search: '',
    rating: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError('');
      const allRatings = await RatingService.getAllRatings();
      setRatings(allRatings);
    } catch (error) {
      console.error('Error loading ratings:', error);
      setError('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.filter(rating => {
    const matchesSearch = rating.tourTitle.toLowerCase().includes(filter.search.toLowerCase()) ||
                         rating.customerName.toLowerCase().includes(filter.search.toLowerCase()) ||
                         rating.customerEmail.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesRating = filter.rating === 'all' || rating.rating.toString() === filter.rating;
    
    return matchesSearch && matchesRating;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (filter.sortBy) {
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'customerName':
        aValue = a.customerName.toLowerCase();
        bValue = b.customerName.toLowerCase();
        break;
      case 'tourTitle':
        aValue = a.tourTitle.toLowerCase();
        bValue = b.tourTitle.toLowerCase();
        break;
      case 'travelDate':
        aValue = new Date(a.travelDate).getTime();
        bValue = new Date(b.travelDate).getTime();
        break;
      default:
        aValue = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        bValue = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
    }
    
    if (filter.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return Math.round((total / ratings.length) * 10) / 10;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="admin-ratings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-ratings">
      <div className="ratings-header">
        <h1>Customer Ratings & Reviews</h1>
        <div className="ratings-summary">
          <div className="summary-item">
            <span className="summary-label">Total Ratings:</span>
            <span className="summary-value">{ratings.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Average Rating:</span>
            <span className="summary-value">
              <StarRating rating={Math.round(getAverageRating())} readOnly={true} size="small" />
              <span className="average-text">{getAverageRating()}/5</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ratings-filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by trip, customer name, or email..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Rating:</label>
          <select
            value={filter.rating}
            onChange={(e) => setFilter(prev => ({ ...prev, rating: e.target.value }))}
            className="filter-select"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
            className="filter-select"
          >
            <option value="createdAt">Date Submitted</option>
            <option value="rating">Rating</option>
            <option value="customerName">Customer Name</option>
            <option value="tourTitle">Trip Name</option>
            <option value="travelDate">Travel Date</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Order:</label>
          <select
            value={filter.sortOrder}
            onChange={(e) => setFilter(prev => ({ ...prev, sortOrder: e.target.value }))}
            className="filter-select"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        <div className="distribution-bars">
          {[5, 4, 3, 2, 1].map(star => {
            const count = getRatingDistribution()[star as keyof typeof getRatingDistribution];
            const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
            return (
              <div key={star} className="distribution-item">
                <span className="star-label">{star}★</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="count-label">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Ratings Table */}
      <div className="ratings-table-container">
        <table className="ratings-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Trip</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Travel Date</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filteredRatings.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  {ratings.length === 0 ? 'No ratings found' : 'No ratings match your filters'}
                </td>
              </tr>
            ) : (
              filteredRatings.map((rating) => (
                <tr key={rating.id}>
                  <td className="customer-cell">
                    <div className="customer-info">
                      <div className="customer-name">{rating.customerName}</div>
                      <div className="customer-email">{rating.customerEmail}</div>
                    </div>
                  </td>
                  <td className="trip-cell">
                    <div className="trip-title">{rating.tourTitle}</div>
                    <div className="booking-id">Booking: {rating.bookingId}</div>
                  </td>
                  <td className="rating-cell">
                    <StarRating rating={rating.rating} readOnly={true} size="small" />
                  </td>
                  <td className="comment-cell">
                    {rating.comment ? (
                      <div className="comment-text">"{rating.comment}"</div>
                    ) : (
                      <span className="no-comment">No comment</span>
                    )}
                  </td>
                  <td className="date-cell">
                    {new Date(rating.travelDate).toLocaleDateString()}
                  </td>
                  <td className="date-cell">
                    {formatDate(rating.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      <div className="pagination-info">
        Showing {filteredRatings.length} of {ratings.length} ratings
      </div>
    </div>
  );
};

export default AdminRatings;
