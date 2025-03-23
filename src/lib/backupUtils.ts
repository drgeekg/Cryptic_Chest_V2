
/**
 * Utilities for backup and restore functionality
 */

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
 * Create a backup of user data
 */
export function createBackup(userId: string, password: string, recoveryPhrase: string): Blob {
  // Get all data from localStorage
  const data: Record<string, any> = {
    passwords: [],
    timestamp: Date.now()
  };
  
  try {
    // Get passwords data
    const dbData = JSON.parse(localStorage.getItem("password_manager_data") || '{"passwords":[]}');
    data.passwords = dbData.passwords.filter((p: any) => p.userId === userId);
    
    // Stringify the data
    const jsonData = JSON.stringify(data);
    
    // Encrypt the data using the recovery phrase
    const encryptedData = encryptBackupData(jsonData, recoveryPhrase);
    
    // Create a Blob with the encrypted data
    return new Blob([encryptedData], { type: "application/json" });
  } catch (error) {
    console.error("Backup creation error:", error);
    throw new Error("Failed to create backup");
  }
}

/**
 * Restore data from a backup file
 */
export function restoreFromBackup(backupData: string, recoveryPhrase: string, userId: string): void {
  try {
    // Decrypt the backup data
    const decryptedData = decryptBackupData(backupData, recoveryPhrase);
    
    // Parse the decrypted data
    const data = JSON.parse(decryptedData);
    
    // Validate the data
    if (!data || !Array.isArray(data.passwords)) {
      throw new Error("Invalid backup data");
    }
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem("password_manager_data") || '{"passwords":[]}');
    
    // Remove existing passwords for this user
    existingData.passwords = existingData.passwords.filter((p: any) => p.userId !== userId);
    
    // Update passwords with the backup data, but ensure they have the current userId
    const updatedPasswords = data.passwords.map((p: any) => ({
      ...p,
      userId // Make sure the passwords are associated with the current user
    }));
    
    // Add the restored passwords
    existingData.passwords = [...existingData.passwords, ...updatedPasswords];
    
    // Save the updated data
    localStorage.setItem("password_manager_data", JSON.stringify(existingData));
    
    return;
  } catch (error) {
    console.error("Restore error:", error);
    throw error;
  }
}
