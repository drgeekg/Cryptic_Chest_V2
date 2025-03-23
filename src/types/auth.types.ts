export interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
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
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: ProfileUpdateData) => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}
