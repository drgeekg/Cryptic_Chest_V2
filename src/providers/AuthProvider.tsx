import { useState, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { User, ProfileUpdateData } from "@/types/auth.types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved authentication state on mount
    const checkAuth = () => {
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        
        // Always prioritize profile-specific data for consistency
        const profileData = localStorage.getItem(`user_profile_${parsedUser.email}`);
        
        if (profileData) {
          try {
            const profileUser = JSON.parse(profileData);
            console.log("Loaded profile data:", profileUser);
            setUser(profileUser);
          } catch (e) {
            console.error("Error parsing profile data:", e);
            setUser(parsedUser);
          }
        } else {
          setUser(parsedUser);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, you would verify with server
      // For demo, we'll simulate authentication
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if this user has previously registered
      const existingUserData = localStorage.getItem(`user_profile_${email}`);
      
      // If no user found with this email, throw error
      if (!existingUserData) {
        throw new Error("User not found. Please register first.");
      }
      
      // Get the password for this user (in a real app, you'd compare hashed passwords)
      const passwordKey = `user_password_${email}`;
      const storedPassword = localStorage.getItem(passwordKey);
      
      // If no password is stored (which would be the case for first-time users after this update)
      // We'll set a default password "password123" for testing
      if (!storedPassword) {
        localStorage.setItem(passwordKey, "password123");
        
        // If entered password doesn't match our default test password
        if (password !== "password123") {
          throw new Error("Invalid password. For demo, try 'password123'");
        }
      } else {
        // Check if password matches
        if (password !== storedPassword) {
          throw new Error("Invalid password");
        }
      }
      
      // At this point, authentication is successful
      let mockUser: User = JSON.parse(existingUserData);
      
      // Store user in local storage
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Login failed:", error);
      if (error instanceof Error) {
        throw error; // Rethrow the original error to preserve the message
      } else {
        throw new Error("Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, you would register with server
      // For demo, we'll simulate registration
      
      // Check if user already exists
      const existingUser = localStorage.getItem(`user_profile_${email}`);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: "user-" + Date.now(),
        name: name,
        email: email
      };
      
      // Store initial profile in user-specific storage
      localStorage.setItem(`user_profile_${email}`, JSON.stringify(mockUser));
      
      // Store the password
      localStorage.setItem(`user_password_${email}`, password);
      
      // Store user in session storage
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUserProfile = (data: ProfileUpdateData) => {
    if (!user) return;

    // Create a properly updated user object with all changes
    const updatedUser = {
      ...user,
      ...data
    };

    console.log("Updating profile to:", updatedUser);

    // Update local storage for the current session
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Also update the user-specific profile storage for persistence between sessions
    localStorage.setItem(`user_profile_${user.email}`, JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // In a real app, you would verify with server
      // For demo, we'll simulate password update
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify the current password
      const passwordKey = `user_password_${user.email}`;
      const storedPassword = localStorage.getItem(passwordKey);
      
      // If no stored password, we'll use our default
      if (!storedPassword) {
        if (currentPassword !== "password123") {
          return Promise.reject(new Error("Current password is incorrect"));
        }
      } else {
        // Verify the current password matches
        if (currentPassword !== storedPassword) {
          return Promise.reject(new Error("Current password is incorrect"));
        }
      }
      
      // Save the new password
      localStorage.setItem(passwordKey, newPassword);
      console.log("Password updated successfully");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Password update failed:", error);
      return Promise.reject(new Error("Password update failed"));
    }
  };

  const deleteAccount = async (password: string) => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // In a real app, you would verify with server
      // For demo, we'll simulate account deletion
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove all user data from localStorage
      localStorage.removeItem(`user_profile_${user.email}`);
      localStorage.removeItem("user");
      
      // Clear any other user-specific data
      // This would depend on what data you store for users
      
      // Update state
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
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
