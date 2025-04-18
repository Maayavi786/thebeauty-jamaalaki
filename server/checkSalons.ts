import 'dotenv/config';
import { DatabaseStorage } from './storage.db.js';
import { db } from './db.js';
import { salons } from '../shared/schema.js';

const storage = new DatabaseStorage();

// Explicit type for salon
interface Salon {
  id: number;
  nameEn?: string;
  nameAr?: string;
  [key: string]: any;
}

async function checkSalons() {
  try {
    console.log('Checking salons in database...');
    
    // Use 'as any' to bypass Drizzle type mismatch
    const allSalons = await db.select().from(salons as any);
    console.log(`Found ${allSalons.length} total salons`);
    
    // Print details for each salon
    for (const salon of allSalons) {
      if (salon && typeof salon === "object" && "id" in salon) {
        console.log(`\nSalon ID: ${(salon as Salon).id}`);
        console.log(`Name (EN): ${(salon as Salon).nameEn}`);
        console.log(`Name (AR): ${(salon as Salon).nameAr}`);
        console.log(`Image URL: ${(salon as Salon).imageUrl || 'No image'}`);
        console.log(`Ladies Only: ${(salon as Salon).isLadiesOnly}`);
      }
    }

  } catch (error) {
    console.error('Error checking salons:', error);
  }
}

checkSalons(); 