
/**
 * This is a simplified local database implementation using localStorage
 * In a real application, you would use MongoDB or another database
 */

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

const DB_KEY = "password_manager_data";

// Initialize the database
export function initDB() {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify({
      passwords: [],
      users: []
    }));
  }
}

// Get all passwords for a user
export function getPasswords(userId: string): StoredPassword[] {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{"passwords":[]}');
  return data.passwords.filter((p: StoredPassword) => p.userId === userId);
}

// Add a new password
export function addPassword(password: Omit<StoredPassword, 'id' | 'createdAt' | 'updatedAt'>): StoredPassword {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{"passwords":[]}');
  
  const newPassword: StoredPassword = {
    ...password,
    id: `pwd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  data.passwords.push(newPassword);
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  
  return newPassword;
}

// Update an existing password
export function updatePassword(id: string, updates: Partial<Omit<StoredPassword, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): StoredPassword {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{"passwords":[]}');
  
  const passwordIndex = data.passwords.findIndex((p: StoredPassword) => p.id === id);
  if (passwordIndex === -1) {
    throw new Error(`Password with id ${id} not found`);
  }
  
  data.passwords[passwordIndex] = {
    ...data.passwords[passwordIndex],
    ...updates,
    updatedAt: Date.now()
  };
  
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  
  return data.passwords[passwordIndex];
}

// Delete a password
export function deletePassword(id: string): void {
  const data = JSON.parse(localStorage.getItem(DB_KEY) || '{"passwords":[]}');
  
  const passwordIndex = data.passwords.findIndex((p: StoredPassword) => p.id === id);
  if (passwordIndex === -1) {
    throw new Error(`Password with id ${id} not found`);
  }
  
  data.passwords.splice(passwordIndex, 1);
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Search passwords
export function searchPasswords(userId: string, query: string): StoredPassword[] {
  const passwords = getPasswords(userId);
  
  if (!query) return passwords;
  
  const lowercaseQuery = query.toLowerCase();
  
  return passwords.filter((password) => {
    return (
      password.name.toLowerCase().includes(lowercaseQuery) ||
      password.url.toLowerCase().includes(lowercaseQuery) ||
      password.username.toLowerCase().includes(lowercaseQuery) ||
      (password.category && password.category.toLowerCase().includes(lowercaseQuery)) ||
      (password.notes && password.notes.toLowerCase().includes(lowercaseQuery))
    );
  });
}

// Filter passwords by category
export function filterPasswordsByCategory(userId: string, category: string): StoredPassword[] {
  const passwords = getPasswords(userId);
  
  if (!category) return passwords;
  
  return passwords.filter((password) => password.category === category);
}

// Initialize the database when this module is imported
initDB();
