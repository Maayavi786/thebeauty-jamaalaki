import 'dotenv/config';
import { DatabaseStorage } from './storage.db';
import { db } from './db';
import { salons } from '../shared/schema';

const storage = new DatabaseStorage();

async function checkSalons() {
  try {
    console.log('Checking salons in database...');
    
    // Get all salons
    const allSalons = await db.select().from(salons);
    console.log(`Found ${allSalons.length} total salons`);
    
    // Print details for each salon
    allSalons.forEach(salon => {
      console.log(`\nSalon ID: ${salon.id}`);
      console.log(`Name (EN): ${salon.nameEn}`);
      console.log(`Image URL: ${salon.imageUrl || 'No image'}`);
      console.log(`Ladies Only: ${salon.isLadiesOnly}`);
    });

  } catch (error) {
    console.error('Error checking salons:', error);
  }
}

checkSalons(); 