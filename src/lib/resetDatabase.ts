/**
 * Utility to reset all application data in localStorage
 */

export function resetAllData(): void {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);
  
  // Loop through and remove all items
  for (const key of keys) {
    // Remove everything except important browser settings
    if (!key.startsWith('browser-')) {
      localStorage.removeItem(key);
    }
  }
  
  console.log('All application data has been reset');
}

/**
 * Reset only user data but preserve app settings
 */
export function resetUserData(): void {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);
  
  // Loop through and remove user-related items
  for (const key of keys) {
    // Remove user profiles, passwords, and related data
    if (
      key === 'user' || 
      key.startsWith('user_profile_') || 
      key.startsWith('user_password_') ||
      key.startsWith('profile_image_') ||
      key.startsWith('passwords_')
    ) {
      localStorage.removeItem(key);
    }
  }
  
  console.log('All user data has been reset');
} 