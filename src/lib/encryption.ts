
/**
 * This is a simplified encryption implementation for demo purposes.
 * In a real application, you would use a proper encryption library.
 */

// Mock function to "encrypt" data with a key
export function encrypt(data: string, key: string): string {
  // In a real app, this would use proper encryption like AES-256
  const encodedData = btoa(data);
  const encodedKey = btoa(key);
  return `${encodedData}.${encodedKey.substring(0, 8)}`;
}

// Mock function to "decrypt" data with a key
export function decrypt(encryptedData: string, key: string): string {
  // In a real app, this would use proper decryption
  try {
    const parts = encryptedData.split('.');
    if (parts.length !== 2) throw new Error("Invalid encrypted data format");
    
    const encodedData = parts[0];
    const keyCheck = parts[1];
    
    const encodedKey = btoa(key);
    if (encodedKey.substring(0, 8) !== keyCheck) {
      throw new Error("Invalid decryption key");
    }
    
    return atob(encodedData);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

// Generate a random password
export function generatePassword(options: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}): string {
  const { 
    length, 
    includeUppercase, 
    includeLowercase, 
    includeNumbers, 
    includeSymbols 
  } = options;
  
  let chars = '';
  
  if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) chars += '0123456789';
  if (includeSymbols) chars += '!@#$%^&*()_+[]{}|;:,.<>?';
  
  if (chars.length === 0) {
    throw new Error("You must select at least one character type");
  }
  
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  
  return password;
}
