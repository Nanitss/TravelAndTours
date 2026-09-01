import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../utils/supabaseService';
import { CustomAuthService } from '../utils/customAuth';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      const result = await CustomAuthService.register(email, password, name, role);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setUserRole(result.user.role || null);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
      }
      
      return { success: result.success, message: result.message };
    } catch (error: any) {
      return { success: false, message: "Failed to create account. Please try again." };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use custom authentication (Firestore users table)
      const result = await CustomAuthService.login(email, password);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setUserRole(result.user.role || null);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        return { success: true, message: "Logged in successfully!" };
      }
      
      return { success: false, message: result.message };
    } catch (error: any) {
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    // Check localStorage for custom auth users only
    const checkStoredUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setUserRole(user.role);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setUserRole(null);
      }
    };

    checkStoredUser();
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    loading,
    isAdmin: userRole === UserRole.ADMIN,
    isClient: userRole === UserRole.CLIENT
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
