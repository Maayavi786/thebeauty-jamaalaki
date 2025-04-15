import 'dotenv/config';
import { DatabaseStorage } from './storage.db';
import { db } from './db';
import { salons } from '../shared/schema';
import { eq } from 'drizzle-orm';

const storage = new DatabaseStorage();

async function updateSalonImages() {
  try {
    console.log('Starting salon image update...');
    
    // Get salons without images
    const salonsWithoutImages = await storage.getSalonsWithoutImages();
    console.log(`Found ${salonsWithoutImages.length} salons without images`);

    // Default image URLs based on salon type
    const defaultImages = {
      ladies: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop',
      unisex: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000&auto=format&fit=crop'
    };

    // Update each salon with appropriate default image
    for (const salon of salonsWithoutImages) {
      const imageUrl = salon.isLadiesOnly ? defaultImages.ladies : defaultImages.unisex;
      
      await db.update(salons)
        .set({ imageUrl })
        .where(eq(salons.id, salon.id));
      
      console.log(`Updated salon ${salon.id} with image: ${imageUrl}`);
    }

    console.log('Salon image update completed successfully');
  } catch (error) {
    console.error('Error updating salon images:', error);
  }
}

updateSalonImages(); 