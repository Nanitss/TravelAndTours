import { TourService } from './firebaseService';

export async function testPackagesInDatabase() {
  try {
    console.log('🧪 Testing packages in database...');
    
    const allTours = await TourService.getAllTours();
    console.log('📦 All tours from database:', allTours);
    console.log('📊 Total tours count:', allTours.length);
    
    if (allTours.length === 0) {
      console.log('❌ No tours found in database!');
      return { success: false, message: 'No tours found in database' };
    }
    
    // Check each tour
    allTours.forEach((tour, index) => {
      console.log(`📋 Tour ${index + 1}:`, {
        id: tour.id,
        title: tour.title,
        destination: tour.destination,
        price: tour.price,
        isActive: tour.isActive,
        availabilityUntil: tour.availabilityUntil,
        imageUrl: tour.imageUrl
      });
    });
    
    // Check active tours
    const activeTours = allTours.filter(tour => tour.isActive);
    console.log('✅ Active tours:', activeTours.length);
    
    // Check available tours (not expired)
    const today = new Date().toISOString().split('T')[0];
    const availableTours = allTours.filter(tour => 
      tour.isActive && tour.availabilityUntil >= today
    );
    console.log('📅 Available tours (not expired):', availableTours.length);
    console.log('📅 Today\'s date:', today);
    
    return {
      success: true,
      message: `Found ${allTours.length} total tours, ${activeTours.length} active, ${availableTours.length} available`,
      totalTours: allTours.length,
      activeTours: activeTours.length,
      availableTours: availableTours.length
    };
    
  } catch (error) {
    console.error('❌ Error testing packages:', error);
    return {
      success: false,
      message: `Error testing packages: ${error}`,
      totalTours: 0,
      activeTours: 0,
      availableTours: 0
    };
  }
}
