import { BookingService } from './supabaseService';

export class BookingChecker {
  private static readonly CHECK_INTERVAL = 1000 * 60 * 30; // Check every 30 minutes
  private static interval: NodeJS.Timeout | null = null;

  static startChecking() {
    if (this.interval) return; // Already running
    
    // Run immediately and then set interval
    this.checkBookings();
    this.interval = setInterval(() => this.checkBookings(), this.CHECK_INTERVAL);
  }

  static stopChecking() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  static async checkBookings() {
    try {
      const bookings = await BookingService.getAllBookings();
      const now = new Date();

      for (const booking of bookings) {
        // Skip if not a partial payment or already voided/cancelled
        if (booking.paymentType !== 'partial' || 
            booking.isVoided || 
            booking.status === 'cancelled' ||
            !booking.amountRemaining ||
            booking.amountRemaining <= 0) {
          continue;
        }

        const departureDate = new Date(booking.departureDate || booking.travelDate);
        const dueDate = new Date(departureDate);
        dueDate.setDate(dueDate.getDate() - 3); // 3 days before departure

        const timeUntilDue = dueDate.getTime() - now.getTime();
        const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));

        // If past due date and not paid, void the booking
        if (timeUntilDue <= 0) {
          await BookingService.updateBooking(booking.id!, {
            isVoided: true,
            voidReason: 'Remaining payment not received by deadline',
            voidDate: now.toISOString(),
            status: 'cancelled',
            updatedAt: now
          });

          // Send notification to user
          await this.notifyBookingVoided(booking);
          continue;
        }

        // Update days until due for warning display
        if (daysUntilDue <= 3) {
          await BookingService.updateBooking(booking.id!, {
            daysUntilDue: daysUntilDue,
            updatedAt: now
          });
        }
      }
    } catch (error) {
      console.error('Error checking bookings:', error);
    }
  }

  private static async notifyBookingVoided(booking: any) {
    try {
      // Send email notification
      // TODO: Implement email notification service
      console.log('Booking voided notification would be sent to:', booking.customerEmail);
      
      // Store notification in user's notifications
      // TODO: Implement notification storage
      console.log('Notification stored for user:', booking.userId);
    } catch (error) {
      console.error('Error sending void notification:', error);
    }
  }
}
