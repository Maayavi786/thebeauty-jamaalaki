import 'dotenv/config';
import { DatabaseStorage } from './storage.db';
import { db } from './db';
import { salons } from '../shared/schema';
import { eq } from 'drizzle-orm';

const storage = new DatabaseStorage();

interface Salon {
  id: number;
  nameEn?: string;
  [key: string]: any;
}

async function updateAllSalonImages() {
  try {
    console.log('Starting salon image update...');
    
    // Get all salons
    const allSalons = await db.select().from(salons as any);
    console.log(`Found ${allSalons.length} salons to update`);

    // Unique high-quality images for each salon (interior shots without people)
    const salonImages = {
      'The Beauty Elegance Spa': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop',
      'Glamour & Grace': 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=1000&auto=format&fit=crop',
      'Elite Beauty Lounge': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
      'Royal Spa & Salon': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000&auto=format&fit=crop',
      'Serenity Beauty Center': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1000&auto=format&fit=crop',
      'Modern Cuts & Colors': 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1000&auto=format&fit=crop',
      'Zen Beauty Retreat': 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1000&auto=format&fit=crop',
      'Chic & Shine': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop',
      'Pure Bliss Salon': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=1000&auto=format&fit=crop',
      'Elegance Studio': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1000&auto=format&fit=crop',
      'Beauty Haven': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'
    };

    // Update each salon with appropriate image
    for (const salon of allSalons) {
      if (salon && typeof salon === "object" && "id" in salon) {
        const imageUrl = salonImages[(salon as Salon).nameEn as keyof typeof salonImages];
        
        if (imageUrl) {
          await db.update(salons as any)
            .set({ imageUrl })
            .where(eq((salons as any).id, (salon as Salon).id));
          
          console.log(`Updated salon "${(salon as Salon).nameEn}" (ID: ${(salon as Salon).id}) with image: ${imageUrl}`);
        } else {
          console.log(`No image found for salon "${(salon as Salon).nameEn}" (ID: ${(salon as Salon).id})`);
        }
      }
    }

    console.log('Salon image update completed successfully');
  } catch (error) {
    console.error('Error updating salon images:', error);
  }
}

// Run the update
updateAllSalonImages(); 