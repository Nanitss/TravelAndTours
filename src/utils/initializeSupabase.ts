import { initializeSampleData, TourService, DestinationService } from './supabaseService';

// Function to initialize Supabase tables with sample data
export async function initializeSupabaseData() {
  try {
    console.log('🚀 Initializing Supabase tables...');
    await initializeSampleData();
    console.log('✅ Supabase tables initialized successfully!');
    
    // Log what was created
    console.log('\n📊 Tables populated:');
    console.log('• users - User profiles and information');
    console.log('• tours - Tour packages and itineraries');
    console.log('• bookings - User bookings and reservations');
    console.log('• destinations - Travel destinations and information');
    
    console.log('\n🎯 Sample data includes:');
    console.log('• 5 destinations (Bali, Tokyo, Boracay, Mount Fuji, New York)');
    console.log('• 5 tour packages with different durations and prices');
    console.log('• Ready for user registrations and bookings');
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing Supabase tables:', error);
    throw error;
  }
}

// Function to check if tables exist and have data
export async function checkSupabaseStatus() {
  try {
    const tours = await TourService.getAllTours();
    const destinations = await DestinationService.getAllDestinations();
    
    console.log('📈 Supabase Status:');
    console.log(`• Tours: ${tours.length} rows`);
    console.log(`• Destinations: ${destinations.length} rows`);
    
    return {
      tours: tours.length,
      destinations: destinations.length,
      isInitialized: tours.length > 0 && destinations.length > 0
    };
  } catch (error) {
    console.error('❌ Error checking Supabase status:', error);
    throw error;
  }
}
