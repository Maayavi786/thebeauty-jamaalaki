import 'dotenv/config';
import { DatabaseStorage } from './storage.db.js';
import { db } from './db.js';
import { salons } from '../shared/schema.js';
import { eq, or } from 'drizzle-orm';

const storage = new DatabaseStorage();

interface Salon {
  id: number;
  nameEn?: string;
  [key: string]: any;
}

async function updateSpecificSalons() {
  try {
    console.log('Starting specific salon image update...');
    
    // Get specific salons by name
    const specificSalons = await db.select().from(salons as any).where(
      or(
        eq((salons as any).nameEn, 'Modern Cuts & Colors'),
        eq((salons as any).nameEn, 'Chic & Shine'),
        eq((salons as any).nameEn, 'Pure Bliss Salon'),
        eq((salons as any).nameEn, 'Beauty Haven')
      )
    );
    
    console.log(`Found ${specificSalons.length} salons to update`);

    // Unique interior images for each salon
    const salonImages = {
      'Modern Cuts & Colors': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop',
      'Chic & Shine': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
      'Pure Bliss Salon': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000&auto=format&fit=crop',
      'Beauty Haven': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1000&auto=format&fit=crop'
    };

    // Update each salon with appropriate image
    for (const salon of specificSalons) {
      if (salon && typeof salon === "object" && "id" in salon) {
        const imageUrl = salonImages[(salon as Salon).nameEn as keyof typeof salonImages];
        
        await db.update(salons as any)
          .set({ imageUrl })
          .where(eq((salons as any).id, (salon as Salon).id));
        
        console.log(`Updated salon "${(salon as Salon).nameEn}" (ID: ${(salon as Salon).id}) with image: ${imageUrl}`);
      }
    }

    console.log('Specific salon image update completed successfully');
  } catch (error) {
    console.error('Error updating specific salon images:', error);
  }
}

// Run the update
updateSpecificSalons(); 