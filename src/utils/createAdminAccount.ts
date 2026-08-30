import { CustomAuthService } from './customAuth';

export async function createAdminAccount() {
  try {
    console.log('Creating admin account...');
    
    const result = await CustomAuthService.createAdminAccount();
    
    if (result.success) {
      console.log('✅ Admin account created successfully!');
      console.log('Email: Admin@gmail.com');
      console.log('Password: Admin123');
      console.log('Role: Admin (Role Number: 2)');
    } else {
      console.log('⚠️', result.message);
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Error creating admin account:', error);
    return { success: false, message: error.message };
  }
}

// Function to check if admin account exists
export async function checkAdminAccount() {
  try {
    const result = await CustomAuthService.createAdminAccount();
    
    if (result.success && result.user) {
      console.log('✅ Admin account exists');
      console.log('Email:', result.user.email);
      console.log('Name:', result.user.name);
      console.log('Role:', result.user.role, '(Role Number: 2)');
      return { exists: true, user: result.user };
    } else {
      console.log('❌ Admin account does not exist');
      return { exists: false };
    }
  } catch (error) {
    console.error('Error checking admin account:', error);
    return { exists: false, error };
  }
}
