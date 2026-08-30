import React, { useState } from 'react';
import { PackageSuggestionService, PackageSuggestion } from '../utils/packageSuggestionService';
import PackageSuggestions from './PackageSuggestions';
import './HeroSection.css';

interface ItineraryFormData {
  arrival: string;
  departure: string;
  passengers: string;
  budget: string;
  prompt: string;
}

interface HeroSectionProps {
  onBookNow?: (tourId: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow }) => {
  const [formData, setFormData] = useState<ItineraryFormData>({
    arrival: '2026-07-15',
    departure: '2026-07-29',
    passengers: '2',
    budget: '150000',
    prompt: ''
  });

  const [suggestions, setSuggestions] = useState<PackageSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof ItineraryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setShowSuggestions(true);
    
    try {
      const packageSuggestions = await PackageSuggestionService.getPackageSuggestions(formData);
      setSuggestions(packageSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (tourId: string) => {
    if (onBookNow) {
      onBookNow(tourId);
    } else {
      // Fallback: redirect to booking page with tour pre-selected
      const bookingUrl = `/booking?tourId=${tourId}`;
      window.location.href = bookingUrl;
    }
  };

  return (
    <>
      <section 
        className="hero-section"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') center/cover no-repeat`
        }}
      >
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Your AI-Powered Japan Travel Package Finder</h1>
            <p className="hero-description">
              Discover the perfect Japan travel packages tailored to your preferences. Our smart AI analyzes your dates, budget, and interests to find the ideal Japanese adventure for you.
            </p>
          </div>

          <div className="itinerary-form-container">
            <div className="form-card">
              <div className="form-inputs">
              <div className="input-row">
                <div className="input-group">
                  <span className="input-icon">📅</span>
                  <input
                    type="date"
                    value={formData.arrival}
                    onChange={(e) => handleInputChange('arrival', e.target.value)}
                    className="form-input"
                    placeholder="Arrival"
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon">📅</span>
                  <input
                    type="date"
                    value={formData.departure}
                    onChange={(e) => handleInputChange('departure', e.target.value)}
                    className="form-input"
                    placeholder="Departure"
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon">👤</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={(e) => handleInputChange('passengers', e.target.value)}
                    className="form-input"
                    placeholder="PAX"
                  />
                </div>
                <div className="input-group">
                  <span className="input-icon">💰</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="form-input"
                    placeholder="Budget"
                  />
                </div>
              </div>
                <div className="prompt-row">
                  <div className="prompt-input-group">
                    <span className="input-icon">➕</span>
                    <input
                      type="text"
                      value={formData.prompt}
                      onChange={(e) => handleInputChange('prompt', e.target.value)}
                      className="prompt-input"
                      placeholder="Tell us how you want your trip to go."
                    />
                  </div>
                  <button 
                    className="generate-btn" 
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    <span>{loading ? 'Generating...' : 'Generate'}</span>
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showSuggestions && (
        <PackageSuggestions 
          suggestions={suggestions}
          onBookNow={handleBookNow}
          loading={loading}
        />
      )}
    </>
  );
};

export default HeroSection;
