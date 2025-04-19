/**
 * MongoDB API client for password management
 * This ensures passwords are only stored in MongoDB, not in localStorage
 */

import axios from 'axios';
import { encrypt, decrypt } from './encryption';

export interface StoredPassword {
  id: string;
  userId: string;
  url: string;
  username: string;
  password: string; // This should be encrypted
  name: string;
  category?: string;
  notes?: string;
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
}

// In-memory cache for the current session only (will be cleared on page refresh)
// This prevents passwords from being stored in localStorage where they can be inspected
let inMemoryPasswordCache: StoredPassword[] = [];

// API Base URL - adjust this to your server address
const API_URL = 'http://localhost:5000/api';

// Axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Adding longer timeout since MongoDB connection might be slow initially
  timeout: 10000,
});

// Flag to control whether to use API or in-memory fallback
// Always set to false for production, only true for testing
const USE_MEMORY_FALLBACK = false;

// Encryption key - should ideally be user-specific and securely stored
// For now we'll use a fixed key for simplicity
const getEncryptionKey = (userId: string) => {
  // This is a simple key derivation for demo purposes
  // In a real app, this should be much more secure
  return `crypticChest_${userId}_key`;
};

// Add auth token to requests
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

// Get all passwords for a user
export async function getPasswords(userId: string): Promise<StoredPassword[]> {
  try {
    // Always try to fetch from MongoDB first
    console.log('Fetching passwords from API');
    const response = await api.get('/passwords');
    console.log('API Response received');
    
    // Transform MongoDB _id to id for frontend compatibility
    // Also decrypt passwords for client-side use
    const encryptionKey = getEncryptionKey(userId);
    const passwords = response.data.map((p: any) => ({
      ...p,
      id: p._id || p.id,
      password: p.password ? decrypt(p.password, encryptionKey) : ''
    }));
    
    // Update in-memory cache for the session
    inMemoryPasswordCache = passwords;
    
    return passwords;
  } catch (error) {
    console.error('Failed to fetch passwords:', error);
    
    // Fallback to memory cache if API fails
    if (USE_MEMORY_FALLBACK) {
      console.log('API failed, using memory cache fallback');
      return inMemoryPasswordCache.filter(p => p.userId === userId);
    }
    
    throw error;
  }
}

// Add a new password
export async function addPassword(
  password: Omit<StoredPassword, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StoredPassword> {
  try {
    // Encrypt the password before sending to server
    const encryptionKey = getEncryptionKey(password.userId);
    const encryptedPasswordData = {
      ...password,
      password: encrypt(password.password, encryptionKey)
    };
    
    console.log('Adding password to MongoDB');
    const response = await api.post('/passwords', encryptedPasswordData);
    
    // Create the password object to return and store in memory cache
    const newPassword = {
      ...response.data,
      id: response.data._id || response.data.id,
      password: password.password // Keep original password in memory only
    };
    
    // Update in-memory cache
    inMemoryPasswordCache.push(newPassword);
    
    return newPassword;
  } catch (error) {
    console.error('Failed to add password:', error);
    throw new Error('Failed to add password to the database');
  }
}

// Update an existing password
export async function updatePassword(
  id: string, 
  updates: Partial<Omit<StoredPassword, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<StoredPassword> {
  try {
    // Get the password from cache or API
    let userId = '';
    const cachedPassword = inMemoryPasswordCache.find(p => p.id === id);
    
    if (cachedPassword) {
      userId = cachedPassword.userId;
    } else {
      // If not in cache, fetch from API
      const response = await api.get('/passwords');
      const currentPassword = response.data.find((p: any) => (p._id === id || p.id === id));
      if (currentPassword) {
        userId = currentPassword.userId;
      }
    }
    
    // Encrypt the password if it's being updated
    let updatesToSend = {...updates};
    if (updates.password && userId) {
      const encryptionKey = getEncryptionKey(userId);
      updatesToSend.password = encrypt(updates.password, encryptionKey);
    }
    
    console.log('Updating password in MongoDB');
    const response = await api.put(`/passwords/${id}`, updatesToSend);
    
    const updatedPassword = {
      ...response.data,
      id: response.data._id || response.data.id,
      password: updates.password || cachedPassword?.password || ''
    };
    
    // Update the password in memory cache
    const index = inMemoryPasswordCache.findIndex(p => p.id === id);
    if (index !== -1) {
      inMemoryPasswordCache[index] = {
        ...inMemoryPasswordCache[index],
        ...updatedPassword
      };
    }
    
    return updatedPassword;
  } catch (error) {
    console.error(`Failed to update password ${id}:`, error);
    throw new Error(`Password with id ${id} could not be updated`);
  }
}

// Delete a password
export async function deletePassword(id: string): Promise<void> {
  try {
    await api.delete(`/passwords/${id}`);
    
    // Remove from in-memory cache
    inMemoryPasswordCache = inMemoryPasswordCache.filter(p => p.id !== id);
  } catch (error) {
    console.error(`Failed to delete password ${id}:`, error);
    throw new Error(`Password with id ${id} could not be deleted`);
  }
}

// Search passwords - search in memory first for speed, then API
export async function searchPasswords(userId: string, query: string): Promise<StoredPassword[]> {
  try {
    // For instant searches, use memory cache first
    if (inMemoryPasswordCache.length > 0) {
      const lowerQuery = query.toLowerCase();
      return inMemoryPasswordCache.filter(p => 
        p.userId === userId && 
        (p.name.toLowerCase().includes(lowerQuery) ||
         p.url.toLowerCase().includes(lowerQuery) ||
         p.username.toLowerCase().includes(lowerQuery) ||
         (p.category && p.category.toLowerCase().includes(lowerQuery)))
      );
    }
    
    // If cache is empty, use API
    const response = await api.get('/passwords/search', {
      params: { query }
    });
    
    const encryptionKey = getEncryptionKey(userId);
    return response.data.map((p: any) => ({
      ...p,
      id: p._id || p.id,
      password: p.password ? decrypt(p.password, encryptionKey) : ''
    }));
  } catch (error) {
    console.error('Failed to search passwords:', error);
    return [];
  }
}

// Filter passwords by category
export async function filterPasswordsByCategory(userId: string, category: string): Promise<StoredPassword[]> {
  try {
    // For instant filtering, use memory cache first
    if (inMemoryPasswordCache.length > 0) {
      return inMemoryPasswordCache.filter(p => 
        p.userId === userId && p.category === category
      );
    }
    
    // If cache is empty, use API
    const response = await api.get(`/passwords/category/${category}`);
    
    const encryptionKey = getEncryptionKey(userId);
    return response.data.map((p: any) => ({
      ...p,
      id: p._id || p.id,
      password: p.password ? decrypt(p.password, encryptionKey) : ''
    }));
  } catch (error) {
    console.error('Failed to filter passwords by category:', error);
    return [];
  }
}

// Clear memory cache on logout
export function clearPasswordCache(): void {
  inMemoryPasswordCache = [];
}

// Initialize - no longer needed with MongoDB
export function initDB(): void {
  // Not using localStorage anymore
}
