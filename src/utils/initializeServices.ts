import { BookingChecker } from './bookingChecker';

export function initializeServices() {
  // Start the booking checker service
  BookingChecker.startChecking();

  // Clean up on app shutdown
  window.addEventListener('beforeunload', () => {
    BookingChecker.stopChecking();
  });
}
