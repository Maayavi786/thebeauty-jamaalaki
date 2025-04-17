import 'dotenv/config';
import { DatabaseStorage } from './storage.db';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { salons } from '../shared/schema';

interface Salon {
  id: number;
  nameEn?: string;
  isLadiesOnly?: boolean;
  [key: string]: any;
}

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
      if (salon && typeof salon === "object" && "id" in salon) {
        const imageUrl = (salon as Salon).isLadiesOnly ? defaultImages.ladies : defaultImages.unisex;
        
        await db.update(salons as any)
          .set({ imageUrl })
          .where(eq((salons as any).id, (salon as Salon).id));
        
        console.log(`Updated salon "${(salon as Salon).nameEn}" (ID: ${(salon as Salon).id}) with image: ${imageUrl}`);
      }
    }

    console.log('Salon image update completed successfully');
  } catch (error) {
    console.error('Error updating salon images:', error);
  }
}

updateSalonImages(); 