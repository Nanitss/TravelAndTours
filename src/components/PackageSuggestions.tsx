import React from 'react';
import { PackageSuggestion, PackageSuggestionService } from '../utils/packageSuggestionService';
import './PackageSuggestions.css';

interface PackageSuggestionsProps {
  suggestions: PackageSuggestion[];
  onBookNow: (tourId: string) => void;
  loading?: boolean;
}

const PackageSuggestions: React.FC<PackageSuggestionsProps> = ({ 
  suggestions, 
  onBookNow, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="package-suggestions">
        <div className="suggestions-header">
          <h2>🤖 AI is analyzing your Japan travel preferences...</h2>
          <p>Finding the perfect Japan packages for you</p>
        </div>
        <div className="loading-suggestions">
          <div className="loading-spinner"></div>
          <p>Searching through our database...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="package-suggestions">
        <div className="suggestions-header">
          <h2>😔 No Japan packages found</h2>
          <p>We couldn't find Japan packages matching your criteria. Try adjusting your preferences.</p>
        </div>
        <div className="no-suggestions">
          <div className="no-suggestions-icon">🔍</div>
          <h3>Suggestions:</h3>
          <ul>
            <li>Adjust your budget range</li>
            <li>Consider different travel dates</li>
            <li>Be more specific about your Japan travel preferences</li>
            <li>Try different passenger numbers</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="package-suggestions">
        <div className="suggestions-header">
          <h2>🎯 Perfect Japan Packages for You</h2>
          <p>AI-powered Japan travel suggestions based on your preferences</p>
        </div>
      
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.tour.id} 
            className={`suggestion-card ${index === 0 ? 'top-suggestion' : ''}`}
          >
            {index === 0 && (
              <div className="top-badge">
                <span className="badge-icon">⭐</span>
                <span>Best Match</span>
              </div>
            )}
            
            <div className="suggestion-image">
              {suggestion.tour.imageUrl ? (
                <img 
                  src={suggestion.tour.imageUrl} 
                  alt={suggestion.tour.title}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`image-placeholder ${suggestion.tour.imageUrl ? 'hidden' : ''}`}>
                <span className="placeholder-icon">🏖️</span>
              </div>
              
              <div className="match-score">
                <span className="score-icon">🎯</span>
                <span>{suggestion.matchScore}% Match</span>
              </div>
            </div>

            <div className="suggestion-content">
              <div className="suggestion-header">
                <h3 className="suggestion-title">{suggestion.tour.title}</h3>
                <div className="suggestion-location">
                  <span className="location-icon">📍</span>
                  <span>{suggestion.tour.destination}</span>
                </div>
              </div>

              <p className="suggestion-description">
                {suggestion.tour.description}
              </p>

              <div className="suggestion-details">
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span>{suggestion.tour.duration} days</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{PackageSuggestionService.formatDate(suggestion.tour.startDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span>Up to {suggestion.tour.duration} people</span>
                </div>
              </div>

              <div className="suggestion-pricing">
                <div className="price-info">
                  <span className="price-per-person">
                    {PackageSuggestionService.formatCurrency(suggestion.pricePerPerson)}/person
                  </span>
                  <span className="total-price">
                    Total: {PackageSuggestionService.formatCurrency(suggestion.totalPrice)}
                  </span>
                </div>
                
                <div className={`budget-indicator ${suggestion.isWithinBudget ? 'within-budget' : 'over-budget'}`}>
                  <span className="budget-icon">
                    {suggestion.isWithinBudget ? '✅' : '⚠️'}
                  </span>
                  <span>
                    {suggestion.isWithinBudget ? 'Within Budget' : 'Over Budget'}
                  </span>
                </div>
              </div>

              <div className="suggestion-reasons">
                <h4>Why this package?</h4>
                <ul>
                  {suggestion.reasons.slice(0, 3).map((reason, reasonIndex) => (
                    <li key={reasonIndex}>{reason}</li>
                  ))}
                </ul>
              </div>

              <button 
                className="book-now-btn"
                onClick={() => onBookNow(suggestion.tour.id!)}
              >
                <span className="btn-icon">🚀</span>
                <span>Book Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackageSuggestions;
