import { TourService } from './firebaseService';

export async function updatePackageDatesTo2025(): Promise<{ success: boolean; message: string; count: number }> {
  try {
    console.log('🔄 Updating package dates to 2025...');
    
    // Get all tours
    const allTours = await TourService.getAllTours();
    console.log('📦 Found tours:', allTours.length);
    
    if (allTours.length === 0) {
      return { success: false, message: 'No tours found to update', count: 0 };
    }
    
    let updatedCount = 0;
    const errors: string[] = [];
    
    for (const tour of allTours) {
      try {
        if (!tour.id) continue;
        
        // Update dates to 2025
        const updatedData = {
          startDate: tour.startDate.replace('2024', '2025'),
          endDate: tour.endDate.replace('2024', '2025'),
          availabilityUntil: tour.availabilityUntil.replace('2024', '2025')
        };
        
        console.log(`🔄 Updating tour "${tour.title}":`, updatedData);
        
        await TourService.updateTour(tour.id, updatedData);
        updatedCount++;
        
      } catch (error) {
        const errorMsg = `Failed to update ${tour.title}: ${error}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    const message = updatedCount > 0 
      ? `Successfully updated ${updatedCount} packages to 2025 dates! ${errors.length > 0 ? `Errors: ${errors.length}` : ''}`
      : `Failed to update packages. Errors: ${errors.join(', ')}`;
    
    console.log(`🎉 Package date update completed: ${message}`);
    
    return {
      success: updatedCount > 0,
      message,
      count: updatedCount
    };
    
  } catch (error) {
    console.error('❌ Error updating package dates:', error);
    return {
      success: false,
      message: `Failed to update package dates: ${error}`,
      count: 0
    };
  }
}
