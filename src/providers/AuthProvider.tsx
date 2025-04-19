import { useState, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { User, ProfileUpdateData } from "@/types/auth.types";
import axios from "axios";
import { clearPasswordCache } from "@/lib/db"; // Import the clear cache function

// API URL - make sure it matches the server address
const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create an axios instance with Authorization header
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to all requests
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    // Check for valid token on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token with backend
          const response = await api.get('/auth/current-user');
          
          // Set user from API response - NO PASSWORDS stored in user object
          setUser({
            id: response.data._id,
            name: response.data.username,
            email: response.data.email
          });
        } catch (error) {
          // Token invalid or expired
          console.error("Authentication error:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Call API to login
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      // Store token but NOT the password
      localStorage.setItem('token', response.data.token);
      
      // Set user data - NO PASSWORD stored in localStorage
      const userData: User = {
        id: response.data.user.id,
        name: response.data.user.username,
        email: response.data.user.email
      };
      
      setUser(userData);
    } catch (error) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Invalid credentials");
      } else {
        throw new Error("Login failed. Check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Generate a random recovery phrase - in a real app, use a better method
      const recoveryPhrase = Math.random().toString(36).substring(2, 15);
      
      // Call API to register
      const response = await api.post('/auth/register', {
        username: name,
        email,
        password,
        recoveryPhrase
      });
      
      // Store token but NOT the password
      localStorage.setItem('token', response.data.token);
      
      // Set user data - NO PASSWORD stored in the state or localStorage
      const userData: User = {
        id: response.data.user.id,
        name: response.data.user.username,
        email: response.data.user.email,
        recoveryPhrase // Store recovery phrase temporarily for display to user
      };
      
      setUser(userData);
      
      // Return the recovery phrase so it can be shown to user
      return recoveryPhrase;
    } catch (error) {
      console.error("Registration failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Registration failed");
      } else {
        throw new Error("Registration failed. Check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // Clear any in-memory password cache to prevent data leakage after logout
    clearPasswordCache();
    setUser(null);
  };

  const updateUserProfile = async (data: ProfileUpdateData) => {
    if (!user) return;
    
    try {
      // In a full implementation, you'd have an API endpoint for profile updates
      // For now, we'll just update the local state
      
      // Create a properly updated user object with all changes
      const updatedUser = {
        ...user,
        ...data
      };
      
      // Update state
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      return false;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Call API to update password
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Password update failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        return Promise.reject(new Error(error.response.data.message || "Password update failed"));
      }
      return Promise.reject(new Error("Password update failed"));
    }
  };

  const resetPassword = async (email: string, recoveryPhrase: string, newPassword: string) => {
    try {
      // Call API to reset password
      await api.post('/auth/recover', {
        email,
        recoveryPhrase,
        newPassword
      });
      
      return true;
    } catch (error) {
      console.error("Password reset failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Password reset failed");
      }
      throw new Error("Password reset failed");
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Call API to delete account
      await api.post('/auth/delete-account', { password });
      
      // Clean up client-side
      localStorage.removeItem('token');
      clearPasswordCache();
      setUser(null);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Account deletion failed:", error);
      return Promise.reject(new Error("Account deletion failed"));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        updatePassword,
        resetPassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
