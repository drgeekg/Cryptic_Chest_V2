export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
  recoveryPhrase?: string; // Add recoveryPhrase for display during registration
}

export interface ProfileUpdateData {
  name?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<string | void>;
  logout: () => void;
  updateUserProfile: (data: ProfileUpdateData) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string, recoveryPhrase: string, newPassword: string) => Promise<boolean>; // Add reset password function
  deleteAccount: (password: string) => Promise<void>;
}
