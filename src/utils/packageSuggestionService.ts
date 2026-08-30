import { Tour } from './firebaseService';
import { TourService } from './firebaseService';

export interface ItineraryFormData {
  arrival: string;
  departure: string;
  passengers: string;
  budget: string;
  prompt: string;
}

export interface PackageSuggestion {
  tour: Tour;
  matchScore: number;
  reasons: string[];
  pricePerPerson: number;
  totalPrice: number;
  isWithinBudget: boolean;
  isDateAvailable: boolean;
}

export class PackageSuggestionService {
  /**
   * Get AI-powered package suggestions based on user preferences
   */
  static async getPackageSuggestions(formData: ItineraryFormData): Promise<PackageSuggestion[]> {
    try {
      // Fetch all available tours
      const allTours = await TourService.getAllTours();
      
      // Filter and score tours based on user preferences
      const suggestions = allTours
        .filter(tour => tour.isActive)
        .map(tour => this.scoreTour(tour, formData))
        .filter(suggestion => suggestion.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6); // Return top 6 suggestions

      return suggestions;
    } catch (error) {
      console.error('Error fetching package suggestions:', error);
      return [];
    }
  }

  /**
   * Score a tour based on how well it matches user preferences
   */
  private static scoreTour(tour: Tour, formData: ItineraryFormData): PackageSuggestion {
    const reasons: string[] = [];
    let matchScore = 0;
    
    // Parse user data
    const userBudget = this.parseBudget(formData.budget);
    const passengers = parseInt(formData.passengers) || 1;
    const arrivalDate = new Date(formData.arrival);
    const departureDate = new Date(formData.departure);
    
    // Parse tour data
    const tourStartDate = new Date(tour.startDate);
    const tourEndDate = new Date(tour.endDate);
    const tourAvailabilityUntil = new Date(tour.availabilityUntil);
    const totalPrice = tour.price * passengers;
    const pricePerPerson = tour.price;
    
    // Check date availability (40 points)
    const isDateAvailable = this.checkDateAvailability(
      arrivalDate, 
      departureDate, 
      tourStartDate, 
      tourEndDate, 
      tourAvailabilityUntil
    );
    
    if (isDateAvailable) {
      matchScore += 40;
      reasons.push('Available on your travel dates');
    }
    
    // Check budget compatibility (30 points)
    const isWithinBudget = totalPrice <= userBudget;
    if (isWithinBudget) {
      matchScore += 30;
      reasons.push(`Within your budget (₱${totalPrice.toLocaleString()})`);
    } else if (totalPrice <= userBudget * 1.2) {
      matchScore += 20;
      reasons.push(`Slightly over budget but great value (₱${totalPrice.toLocaleString()})`);
    }
    
    // Check duration compatibility (20 points)
    const durationMatch = this.checkDurationMatch(
      arrivalDate, 
      departureDate, 
      tour.duration
    );
    if (durationMatch > 0) {
      matchScore += durationMatch;
      reasons.push(`Ideal ${tour.duration}-day duration`);
    }
    
    // Check prompt preferences (10 points)
    const promptMatch = this.checkPromptMatch(tour, formData.prompt);
    if (promptMatch > 0) {
      matchScore += promptMatch;
      reasons.push('Matches your travel preferences');
    }
    
    // Japan-specific bonus (10 points)
    if (tour.destination.toLowerCase().includes('japan')) {
      matchScore += 10;
      reasons.push('Perfect for Japan travel');
    }
    
    return {
      tour,
      matchScore,
      reasons,
      pricePerPerson,
      totalPrice,
      isWithinBudget,
      isDateAvailable
    };
  }

  /**
   * Parse budget string to number
   */
  private static parseBudget(budgetStr: string): number {
    const cleaned = budgetStr.replace(/[,$]/g, '');
    return parseInt(cleaned) || 0;
  }

  /**
   * Check if tour dates are available for user's travel dates
   */
  private static checkDateAvailability(
    userArrival: Date,
    userDeparture: Date,
    tourStart: Date,
    tourEnd: Date,
    tourAvailabilityUntil: Date
  ): boolean {
    // Check if tour is still available for booking
    if (tourAvailabilityUntil < userArrival) {
      return false;
    }
    
    // Check if tour dates overlap with user's travel dates
    const userArrivalTime = userArrival.getTime();
    const userDepartureTime = userDeparture.getTime();
    const tourStartTime = tourStart.getTime();
    const tourEndTime = tourEnd.getTime();
    
    // Tour should start on or after user arrival and end on or before user departure
    return tourStartTime >= userArrivalTime && tourEndTime <= userDepartureTime;
  }


  /**
   * Check duration compatibility
   */
  private static checkDurationMatch(
    userArrival: Date,
    userDeparture: Date,
    tourDuration: number
  ): number {
    const userDuration = Math.ceil(
      (userDeparture.getTime() - userArrival.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const durationDiff = Math.abs(userDuration - tourDuration);
    
    if (durationDiff === 0) {
      return 15; // Perfect match
    } else if (durationDiff <= 2) {
      return 10; // Close match
    } else if (durationDiff <= 5) {
      return 5; // Reasonable match
    }
    
    return 0;
  }

  /**
   * Check if tour matches user's prompt preferences
   */
  private static checkPromptMatch(tour: Tour, userPrompt: string): number {
    if (!userPrompt.trim()) {
      return 5; // Default score if no prompt
    }
    
    const prompt = userPrompt.toLowerCase();
    const tourText = `${tour.title} ${tour.description} ${tour.destination}`.toLowerCase();
    
    // Check for keywords
    const keywords = [
      'adventure', 'relax', 'luxury', 'budget', 'culture', 'nature', 
      'beach', 'mountain', 'city', 'food', 'history', 'romantic',
      'family', 'solo', 'group', 'photography', 'hiking', 'diving'
    ];
    
    let matchCount = 0;
    keywords.forEach(keyword => {
      if (prompt.includes(keyword) && tourText.includes(keyword)) {
        matchCount++;
      }
    });
    
    return Math.min(matchCount * 2, 10);
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
