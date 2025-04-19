/**
 * Utilities for backup and restore functionality with MongoDB integration
 */
import axios from 'axios';
import { StoredPassword } from './db';
import { encrypt as encryptPassword, decrypt as decryptPassword } from './encryption';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Axios instance with auth token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// List of simple 3-5 letter words for recovery phrases
const wordList = [
  "ace", "add", "air", "all", "and", "ant", "any", "arm", "art", "ask", 
  "bad", "bag", "bat", "bed", "bee", "big", "bit", "box", "boy", "bug", 
  "bus", "but", "buy", "cab", "can", "cap", "car", "cat", "cow", "cry", 
  "cup", "cut", "dad", "day", "den", "dig", "dim", "dip", "dog", "dot", 
  "dry", "due", "ear", "eat", "egg", "end", "eye", "fan", "far", "fat", 
  "fed", "fee", "few", "fig", "fit", "fix", "fly", "fog", "for", "fox", 
  "fun", "gap", "gas", "gel", "gem", "get", "gig", "gin", "got", "gum", 
  "gun", "gut", "guy", "gym", "had", "ham", "has", "hat", "hay", "hem", 
  "hen", "her", "hey", "him", "hip", "his", "hit", "hog", "hot", "how", 
  "hub", "hug", "hut", "ice", "icy", "ink", "inn", "ion", "its", "ivy",
  "jam", "jar", "jaw", "jet", "job", "jog", "joy", "jug", "jump", "keep",
  "kick", "kind", "king", "kite", "knee", "knot", "lake", "lamp", "land",
  "last", "late", "lazy", "leaf", "lean", "left", "less", "life", "lift",
  "like", "line", "link", "lion", "list", "live", "load", "loaf", "lock",
  "look", "love", "luck", "made", "mail", "main", "make", "male", "mall",
  "many", "mark", "mask", "math", "meal", "mean", "meat", "meet", "melt",
  "milk", "mind", "mine", "miss", "mist", "moon", "more", "most", "move",
  "much", "must", "name", "near", "neat", "neck", "need", "nest", "news"
];

/**
 * Generate a recovery phrase with 10-15 random words
 */
export function generateRecoveryPhrase(): string {
  const wordCount = Math.floor(Math.random() * 6) + 10; // 10-15 words
  const phrase = [];
  
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    phrase.push(wordList[randomIndex]);
  }
  
  return phrase.join(' ');
}

/**
 * Simple encryption for backup data
 * In a real app, you would use proper encryption libraries
 */
export function encryptBackupData(data: string, recoveryPhrase: string): string {
  try {
    // This is a simplified "encryption" - in a real app use proper crypto
    const encryptedData = btoa(unescape(encodeURIComponent(data))) + "_" + btoa(recoveryPhrase);
    return encryptedData;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt backup data");
  }
}

/**
 * Simple decryption for backup data
 * In a real app, you would use proper encryption libraries
 */
export function decryptBackupData(encryptedData: string, recoveryPhrase: string): string {
  try {
    // Check if the data has the proper format
    const parts = encryptedData.split("_");
    if (parts.length !== 2) {
      throw new Error("Invalid backup format");
    }
    
    // Check if the recovery phrase matches
    const storedPhrase = atob(parts[1]);
    if (storedPhrase !== recoveryPhrase) {
      throw new Error("Incorrect recovery phrase");
    }
    
    // Decrypt the data
    return decodeURIComponent(escape(atob(parts[0])));
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt backup data");
  }
}

/**
 * Create a backup of user data from MongoDB
 */
export async function createBackup(userId: string, password: string, recoveryPhrase: string): Promise<Blob> {
  // Data structure for the backup
  const data: Record<string, any> = {
    passwords: [],
    timestamp: Date.now()
  };
  
  try {
    // Fetch passwords from MongoDB via API
    const response = await api.get('/passwords');
    
    if (response.data && Array.isArray(response.data)) {
      // Get the encryption key
      const encryptionKey = `crypticChest_${userId}_key`;
      
      // Add all passwords to the backup, decrypting them first then re-encrypting with the recovery phrase
      data.passwords = response.data.map((p: any) => {
        // Decrypt the password from MongoDB format using the user's encryption key
        const decryptedPassword = decryptPassword(p.password, encryptionKey);
        
        // Create a clean password object for the backup
        return {
          id: p._id || p.id,
          userId: p.userId,
          url: p.url,
          username: p.username,
          password: decryptedPassword, // Store password in decrypted form within the encrypted backup
          name: p.name,
          category: p.category || '',
          notes: p.notes || '',
          favorite: p.favorite || false,
          createdAt: p.createdAt || Date.now(),
          updatedAt: p.updatedAt || Date.now()
        };
      });
    }
    
    // Stringify the data
    const jsonData = JSON.stringify(data);
    
    // Encrypt the data using the recovery phrase
    const encryptedData = encryptBackupData(jsonData, recoveryPhrase);
    
    // Create a Blob with the encrypted data
    return new Blob([encryptedData], { type: "application/json" });
  } catch (error) {
    console.error("Backup creation error:", error);
    throw new Error("Failed to create backup from MongoDB");
  }
}

/**
 * Restore data from a backup file to MongoDB
 */
export async function restoreFromBackup(backupData: string, recoveryPhrase: string, userId: string): Promise<void> {
  try {
    // Decrypt the backup data
    const decryptedData = decryptBackupData(backupData, recoveryPhrase);
    
    // Parse the decrypted data
    const data = JSON.parse(decryptedData);
    
    // Validate the data
    if (!data || !Array.isArray(data.passwords)) {
      throw new Error("Invalid backup data");
    }
    
    // Get encryption key for re-encrypting passwords
    const encryptionKey = `crypticChest_${userId}_key`;
    
    // Delete existing passwords for this user via API
    const existingPasswords = await api.get('/passwords');
    if (existingPasswords.data && Array.isArray(existingPasswords.data)) {
      for (const pwd of existingPasswords.data) {
        if (pwd.userId === userId) {
          await api.delete(`/passwords/${pwd._id || pwd.id}`);
        }
      }
    }
    
    // Create new password entries from backup data
    for (const password of data.passwords) {
      // Create a new password entry with MongoDB structure
      const newPasswordEntry = {
        userId,
        url: password.url,
        username: password.username,
        password: encryptPassword(password.password, encryptionKey), // Re-encrypt for MongoDB storage
        name: password.name,
        category: password.category,
        notes: password.notes,
        favorite: password.favorite
      };
      
      // Add password to MongoDB via API
      await api.post('/passwords', newPasswordEntry);
    }
    
    return;
  } catch (error) {
    console.error("Restore error:", error);
    throw error;
  }
}
