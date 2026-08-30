import React, { useState } from 'react';
import { RatingService } from '../utils/firebaseService';
import StarRating from './StarRating';
import './RatingModal.css';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: () => void;
  bookingData: {
    bookingId: string;
    tourId: string;
    tourTitle: string;
    travelDate: string;
  };
  userData: {
    userId: string;
    customerName: string;
    customerEmail: string;
  };
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onRatingSubmitted,
  bookingData,
  userData
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await RatingService.createRating({
        bookingId: bookingData.bookingId,
        tourId: bookingData.tourId,
        tourTitle: bookingData.tourTitle,
        userId: userData.userId,
        customerName: userData.customerName,
        customerEmail: userData.customerEmail,
        rating,
        comment: comment.trim() || undefined,
        travelDate: bookingData.travelDate
      });

      console.log('Rating submitted successfully');
      onRatingSubmitted();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setRating(0);
      setComment('');
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay" onClick={handleClose}>
      <div className="rating-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h3>Rate Your Trip Experience</h3>
          <button className="close-btn" onClick={handleClose} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rating-form">
          <div className="rating-section">
            <div className="trip-info">
              <h4>{bookingData.tourTitle}</h4>
              <p>Travel Date: {new Date(bookingData.travelDate).toLocaleDateString()}</p>
            </div>

            <div className="rating-input">
              <label>Overall Rating *</label>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="large"
                showLabel={true}
              />
            </div>

            <div className="comment-input">
              <label htmlFor="comment">Share your experience (optional)</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your trip experience..."
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="character-count">
                {comment.length}/500 characters
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="rating-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
