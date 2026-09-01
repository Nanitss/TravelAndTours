import { initializeSampleData } from './supabaseService';
import { CustomAuthService } from './customAuth';

export async function createSampleData() {
  try {
    console.log('🚀 Creating sample data...');
    
    // Create sample admin account
    console.log('Creating sample admin account...');
    const adminResult = await CustomAuthService.createAdminAccount();
    
    if (adminResult.success) {
      console.log('✅ Sample admin account created!');
      console.log('Email: Admin@gmail.com');
      console.log('Password: Admin123');
      console.log('Role: Admin (Role Number: 2)');
    } else {
      console.log('⚠️ Admin account already exists or creation failed');
    }
    
    // Create sample client account
    console.log('Creating sample client account...');
    const clientResult = await CustomAuthService.register(
      'client@example.com',
      'Client123',
      'Sample Client',
      1 // Role 1 = Client
    );
    
    if (clientResult.success) {
      console.log('✅ Sample client account created!');
      console.log('Email: client@example.com');
      console.log('Password: Client123');
      console.log('Role: Client (Role Number: 1)');
    } else {
      console.log('⚠️ Client account creation failed');
    }
    
    // Initialize Supabase tables with sample data
    console.log('Creating sample tours and destinations...');
    await initializeSampleData();
    
    console.log('🎉 Sample data created successfully!');
    console.log('\n📋 Sample Accounts:');
    console.log('👤 Admin: Admin@gmail.com / Admin123 (Role 2)');
    console.log('👤 Client: client@example.com / Client123 (Role 1)');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    return { success: false, error };
  }
}
