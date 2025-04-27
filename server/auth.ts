import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password using scrypt
 * @param password - The password to hash
 * @returns A string containing the hashed password and salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compares a password with a stored hash
 * @param suppliedPassword - The password to compare
 * @param storedHash - The stored password hash
 * @returns A boolean indicating if the passwords match
 */
import * as bcrypt from 'bcrypt';

export async function comparePasswords(
  suppliedPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    console.log('Supplied password:', suppliedPassword);
    console.log('Stored hash:', storedHash);
    
    // Check if the hash is a bcrypt hash (starts with $2b$)
    if (storedHash.startsWith('$2b$')) {
      console.log('Detected bcrypt hash format');
      // Use bcrypt.compare for bcrypt hashes
      const result = await bcrypt.compare(suppliedPassword, storedHash);
      console.log('Bcrypt comparison result:', result);
      return result;
    }
    
    // Original scrypt implementation for hashes with format "hash.salt"
    if (storedHash.includes('.')) {
      console.log('Using scrypt comparison method');
      const [hashedPassword, salt] = storedHash.split(".");
      
      if (!hashedPassword || !salt) {
        console.error('Missing hash or salt components');
        return false;
      }
      
      console.log('Extracted hash:', hashedPassword);
      console.log('Extracted salt:', salt);

      // Get the hashed password buffer
      const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
      console.log('Hash buffer length:', hashedPasswordBuf.length);
      
      // Hash the supplied password with the same salt
      const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
      console.log('Supplied password buffer length:', suppliedPasswordBuf.length);
      
      // Ensure the buffers are the same length before comparing
      if (hashedPasswordBuf.length !== suppliedPasswordBuf.length) {
        console.error(`Buffer length mismatch: ${hashedPasswordBuf.length} vs ${suppliedPasswordBuf.length}`);
        return false;
      }
      
      // Safe comparison of the buffers
      const result = timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
      console.log('Password comparison result:', result);
      return result;
    }
    
    // For testing only - direct comparison fallback
    console.error('Unknown hash format, using direct comparison as fallback');
    return storedHash === suppliedPassword;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}