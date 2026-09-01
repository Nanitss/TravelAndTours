import { User, UserRole, UserService } from './supabaseService';

// Simple password hashing (in production, use bcrypt or similar)
const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use proper hashing
  return btoa(password + 'salt');
};

const verifyPassword = (password: string, storedPassword: string): boolean => {
  // Always hash the input password and compare with stored hash
  const hashedInputPassword = hashPassword(password);
  return hashedInputPassword === storedPassword;
};

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export class CustomAuthService {
  // Register a new user
  static async register(
    email: string, 
    password: string, 
    name: string, 
    role: UserRole
  ): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return { success: false, message: 'User already exists with this email' };
      }

      // Create new user
      const hashedPassword = hashPassword(password);
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email,
        password: hashedPassword,
        name,
        role
      };

      const userId = await UserService.createUser(userData);
      
      // Get the created user
      const newUser = await UserService.getUserById(userId);
      
      return { 
        success: true, 
        message: 'Account created successfully!',
        user: newUser || undefined
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Failed to create account. Please try again.' 
      };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('Attempting login for:', email);
      
      // Find user by email
      const user = await UserService.getUserByEmail(email);
      
      if (!user) {
        console.log('No user found with email:', email);
        return { success: false, message: 'User not found' };
      }

      // Get the actual email and password fields (handle both cases)
      const userEmail = user.Email || user.email;
      const userPassword = user.Password || user.password;
      const userName = user.Username || user.name;
      
      // Verify password
      const isPasswordValid = verifyPassword(password, userPassword || '');
      
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid password' };
      }

      // Create a normalized user object
      const normalizedUser: User = {
        id: user.id,
        email: userEmail,
        name: userName,
        role: user.role || UserRole.ADMIN,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      return { 
        success: true, 
        message: 'Login successful!',
        user: normalizedUser
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Login failed. Please try again.' 
      };
    }
  }

  // Create admin account
  static async createAdminAccount(): Promise<AuthResult> {
    try {
      // Check if admin already exists
      const existingAdmin = await UserService.getUserByEmail('Admin@gmail.com');
      if (existingAdmin) {
        return { 
          success: false, 
          message: 'Admin account already exists',
          user: existingAdmin
        };
      }

      // Create admin account
      return await this.register(
        'Admin@gmail.com',
        'Admin123',
        'Admin User',
        UserRole.ADMIN
      );
    } catch (error) {
      console.error('Create admin error:', error);
      return { 
        success: false, 
        message: 'Failed to create admin account' 
      };
    }
  }

  // Check if user is admin
  static isAdmin(user: User | null): boolean {
    return user?.role === UserRole.ADMIN;
  }

  // Check if user is client
  static isClient(user: User | null): boolean {
    return user?.role === UserRole.CLIENT;
  }

  // Get role name
  static getRoleName(role: UserRole): string {
    switch (role) {
      case UserRole.CLIENT:
        return 'Client';
      case UserRole.ADMIN:
        return 'Admin';
      default:
        return 'Unknown';
    }
  }

  // Change user password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResult> {
    try {
      // Get the current user
      const user = await UserService.getUserById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Get the stored password (handle both Password and password fields)
      const storedPassword = user.Password || user.password;
      
      // Verify current password
      const isCurrentPasswordValid = verifyPassword(currentPassword, storedPassword || '');
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      // Hash the new password
      const hashedNewPassword = hashPassword(newPassword);

      // Update the user's password
      await UserService.updateUser(userId, { 
        password: hashedNewPassword
      });

      return { 
        success: true, 
        message: 'Password updated successfully!' 
      };
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        message: 'Failed to update password. Please try again.' 
      };
    }
  }
}
