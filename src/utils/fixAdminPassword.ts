import { UserService } from './firebaseService';

// Simple password hashing (same as in customAuth.ts)
const hashPassword = (password: string): string => {
  return btoa(password + 'salt');
};

export async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    // Get the admin user
    const adminUser = await UserService.getUserByEmail('Admin@gmail.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return { success: false, message: 'Admin user not found' };
    }
    
    console.log('📋 Current admin user:', adminUser);
    
    // Hash the password "Admin123"
    const hashedPassword = hashPassword('Admin123');
    console.log('🔐 Original password: Admin123');
    console.log('🔐 Hashed password:', hashedPassword);
    
    // Update the admin user's password
    console.log('🔄 Updating admin user with ID:', adminUser.id);
    console.log('🔄 Updating with hashed password:', hashedPassword);
    
    await UserService.updateUser(adminUser.id!, {
      password: hashedPassword,
      Password: hashedPassword // Update both fields for compatibility
    });
    
    console.log('✅ Admin password update call completed!');
    
    // Verify the update by fetching the user again
    const updatedUser = await UserService.getUserByEmail('Admin@gmail.com');
    console.log('🔍 Updated user data:', updatedUser);
    console.log('🔍 Updated password field:', updatedUser?.password);
    console.log('🔍 Updated Password field:', updatedUser?.Password);
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: Admin@gmail.com');
    console.log('🔑 Password: Admin123 (now properly hashed)');
    
    return { 
      success: true, 
      message: 'Admin password fixed successfully!' 
    };
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    return { 
      success: false, 
      message: `Failed to fix admin password: ${error}` 
    };
  }
}

// Function to verify the admin password is working
export async function verifyAdminPassword() {
  try {
    console.log('🔍 Verifying admin password...');
    
    const adminUser = await UserService.getUserByEmail('Admin@gmail.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return { success: false, message: 'Admin user not found' };
    }
    
    const storedPassword = adminUser.Password || adminUser.password;
    const hashedInput = hashPassword('Admin123');
    
    console.log('📋 Stored password:', storedPassword);
    console.log('🔐 Hashed input (Admin123):', hashedInput);
    console.log('✅ Passwords match:', storedPassword === hashedInput);
    
    return { 
      success: storedPassword === hashedInput, 
      message: storedPassword === hashedInput ? 'Password verification successful!' : 'Password verification failed!' 
    };
    
  } catch (error) {
    console.error('❌ Error verifying admin password:', error);
    return { 
      success: false, 
      message: `Failed to verify admin password: ${error}` 
    };
  }
}
