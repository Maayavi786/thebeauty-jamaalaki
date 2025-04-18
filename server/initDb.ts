import { db } from './db.js';
import { 
  users as usersTable, salons, services, Salon
} from '../shared/schema.js';
import { sql, inArray, eq } from 'drizzle-orm';
import { hashPassword } from './auth.js';

let isInitialized: boolean = false;

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    console.log("Database already initialized, skipping...");
    await updateGlamourGraceInfo();
    return;
  }

  console.log("Checking if database needs initialization...");

  try {
    // Check if we already have users using SQL directly
    const result = await db.execute(sql`SELECT COUNT(*) FROM users`);
    const count: number = Number(result.rows[0]?.count || 0);
    
    if (count > 0) {
      console.log("Database already has users, skipping initialization.");
      isInitialized = true;
      return;
    }

    console.log("Initializing database with sample data...");

    // Hash passwords for security
    const adminPassword: string = await hashPassword('admin123');
    const ownerPassword: string = await hashPassword('password123');
    const customerPassword: string = await hashPassword('password123');

    // Add admin user
    const adminResult = await db.execute(sql`
      INSERT INTO users (username, password, email, full_name, phone, role, preferred_language, created_at) 
      VALUES ('admin', ${adminPassword}, 'admin@jamaalaki.sa', 'Admin User', '+966501234567', 'admin', 'en', NOW())
      RETURNING id
    `);
    const adminId: number = Number(adminResult.rows[0]?.id);

    // Add salon owner
    const ownerResult = await db.execute(sql`
      INSERT INTO users (username, password, email, full_name, phone, role, preferred_language, created_at) 
      VALUES ('salonowner1', ${ownerPassword}, 'owner@elegancespa.sa', 'Sarah Al-Qahtani', '+966501234568', 'salon_owner', 'ar', NOW())
      RETURNING id
    `);
    const ownerId: number = Number(ownerResult.rows[0]?.id);

    // Add customer
    await db.execute(sql`
      INSERT INTO users (username, password, email, full_name, phone, role, preferred_language, created_at) 
      VALUES ('customer1', ${customerPassword}, 'customer@example.com', 'Fatima Abdullah', '+966501234569', 'customer', 'en', NOW())
    `);

    // Add first salon
    const salon1Result = await db.execute(sql`
      INSERT INTO salons (owner_id, name_en, name_ar, description_en, description_ar, address, city, email, phone, 
                         is_ladies_only, has_private_rooms, is_hijab_friendly, is_verified, rating, price_range, created_at, image_url) 
      VALUES (${ownerId}, 'The Beauty Elegance Spa', 'ذا بيوتي للسبا الفاخر', 
              'Luxury spa and beauty salon with a focus on personalized care.', 
              'صالون سبا وتجميل فاخر مع التركيز على العناية الشخصية.',
              'King Fahd Road, Al Ahsa', 'Al Ahsa | الأحساء', 'contact@thebeauty.sa', '+966512345678',
              true, true, true, true, 4.8, 'premium', NOW(),
              'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop')
      RETURNING id
    `);
    const salon1Id: number = Number(salon1Result.rows[0]?.id);

    // Add second salon
    const salon2Result = await db.execute(sql`
      INSERT INTO salons (owner_id, name_en, name_ar, description_en, description_ar, address, city, email, phone, 
                         is_ladies_only, has_private_rooms, is_hijab_friendly, is_verified, rating, price_range, created_at) 
      VALUES (${ownerId}, 'The Beauty Lounge', 'ذا بيوتي لاونج', 
              'Contemporary beauty treatments in a stylish environment.', 
              'علاجات تجميل معاصرة في بيئة أنيقة.',
              'Tahlia Street, Al Ahsa', 'Al Ahsa | الأحساء', 'info@thebeauty.sa', '+966512345679',
              true, true, true, true, 4.6, 'premium', NOW(),
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80')
      RETURNING id
    `);
    const salon2Id: number = Number(salon2Result.rows[0]?.id);

    // Add Glamour & Grace Salon
    const glamourGraceResult = await db.execute(sql`
      INSERT INTO salons (owner_id, name_en, name_ar, description_en, description_ar, address, city, email, phone, 
                         is_ladies_only, has_private_rooms, is_hijab_friendly, is_verified, rating, price_range, created_at, image_url) 
      VALUES (${ownerId}, 'Glamour & Grace', 'الأناقة والجمال', 
              'Elegant beauty salon offering premium services', 
              'صالون تجميل أنيق يقدم خدمات مميزة',
              'King Fahd Road, Al Ahsa', 'Al Ahsa | الأحساء', 'info@glamourgrace.sa', '+966512345680',
              true, true, true, true, 4.7, 'premium', NOW(),
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80')
      RETURNING id
    `);
    const glamourGraceId: number = Number(glamourGraceResult.rows[0]?.id);

    // Add Pure Bliss Salon
    const pureBlissResult = await db.execute(sql`
      INSERT INTO salons (owner_id, name_en, name_ar, description_en, description_ar, address, city, email, phone, 
                         is_ladies_only, has_private_rooms, is_hijab_friendly, is_verified, rating, price_range, created_at, image_url) 
      VALUES (${ownerId}, 'Pure Bliss Salon', 'صالون النعيم', 
              'Relaxation and beauty in one place', 
              'الراحة والجمال في مكان واحد',
              '258 Harmony Road', 'Al Ahsa | الأحساء', 'bliss@example.com', '+971508901234',
              true, false, false, false, 5, 'premium', NOW(),
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop')
      RETURNING id
    `);
    const pureBlissId: number = Number(pureBlissResult.rows[0]?.id);

    // Add services for first salon
    await db.execute(sql`
      INSERT INTO services (salon_id, name_en, name_ar, description_en, description_ar, price, duration, category, image_url)
      VALUES 
        (${salon1Id}, 'Luxury Facial Treatment', 'علاج الوجه الفاخر', 
         'Complete facial treatment with premium products', 'علاج كامل للوجه باستخدام منتجات ممتازة',
         450, 60, 'facial', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon1Id}, 'Hair Cut', 'قص الشعر',
         'Professional haircut service', 'خدمة قص شعر احترافية',
         150, 45, 'haircuts', 'https://images.unsplash.com/photo-1560869713-ba92fec5b462?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon1Id}, 'Hair Cut & Styling', 'قص وتصفيف الشعر',
         'Professional haircut and styling', 'قص وتصفيف الشعر الاحترافي',
         200, 45, 'haircuts', 'https://images.unsplash.com/photo-1560869713-ba92fec5b462?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon1Id}, 'Manicure & Pedicure', 'مانيكير وباديكير',
         'Complete nail care for hands and feet', 'عناية كاملة بالأظافر لليدين والقدمين',
         180, 60, 'nails', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon1Id}, 'Bridal Makeup', 'مكياج العروس',
         'Complete bridal makeup with trial session', 'مكياج عروس كامل مع جلسة تجريبية',
         1200, 120, 'makeup', 'https://images.unsplash.com/photo-1579187707643-35646d22b596?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')
    `);

    // Add services for second salon
    await db.execute(sql`
      INSERT INTO services (salon_id, name_en, name_ar, description_en, description_ar, price, duration, category, image_url)
      VALUES 
        (${salon2Id}, 'Hair Cut', 'قص الشعر',
         'Professional haircut service', 'خدمة قص شعر احترافية',
         150, 45, 'haircuts', 'https://images.unsplash.com/photo-1560869713-ba92fec5b462?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon2Id}, 'Hair Coloring', 'صبغ الشعر',
         'Professional hair coloring service', 'خدمة صبغ شعر احترافية',
         400, 120, 'coloring', 'https://images.unsplash.com/photo-1560869713-ba92fec5b462?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon2Id}, 'Manicure & Pedicure', 'مانيكير وباديكير',
         'Complete nail care for hands and feet', 'عناية كاملة بالأظافر لليدين والقدمين',
         180, 60, 'nails', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'),
        
        (${salon2Id}, 'Makeup Application', 'تطبيق المكياج',
         'Professional makeup for special occasions', 'مكياج احترافي للمناسبات الخاصة',
         300, 60, 'makeup', 'https://images.unsplash.com/photo-1579187707643-35646d22b596?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')
    `);

    // Run cleanup operations only once during initialization
    await cleanupDuplicateSalons();
    await cleanupSalonDescriptions();
    await updatePureBlissImage();
    await updateDuplicateImages();
    await updateSalonLocations();

    console.log("Database successfully initialized with sample data.");
    isInitialized = true;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export async function updateSalonLocations(): Promise<void> {
  console.log("Updating salon locations to Al Ahsa...");
  
  try {
    // Update all salons' city and address information
    await db.execute(sql`
      UPDATE salons 
      SET 
        city = 'Al Ahsa | الأحساء',
        address = CASE 
          WHEN address LIKE '%Riyadh%' THEN REPLACE(address, 'Riyadh', 'Al Ahsa')
          WHEN address LIKE '%Jeddah%' THEN REPLACE(address, 'Jeddah', 'Al Ahsa')
          ELSE address
        END
    `);
    
    console.log("Successfully updated all salon locations to Al Ahsa");
  } catch (error) {
    console.error("Error updating salon locations:", error);
    throw error;
  }
}

async function cleanupDuplicateSalons(): Promise<void> {
  console.log('Cleaning up duplicate salons...');
  try {
    // Get all salons
    const allSalons: Salon[] = await db.select().from(salons);
    
    // Create a map to track unique salons by name
    const uniqueSalons: Map<string, Salon> = new Map();
    const duplicates: number[] = [];
    
    // Identify duplicates
    for (const salon of allSalons) {
      const key: string = `${salon.nameEn}-${salon.address}`;
      if (uniqueSalons.has(key)) {
        duplicates.push(salon.id);
      } else {
        uniqueSalons.set(key, salon);
      }
    }
    
    // Delete duplicates
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate salons to remove`);
      await db.delete(salons).where(inArray(salons.id, duplicates));
      console.log('Successfully removed duplicate salons');
    } else {
      console.log('No duplicate salons found');
    }
  } catch (error) {
    console.error('Error cleaning up duplicate salons:', error);
  }
}

async function cleanupSalonDescriptions(): Promise<void> {
  console.log('Cleaning up salon descriptions...');
  try {
    // Get all salons
    const allSalons: Salon[] = await db.select().from(salons);
    
    // Update each salon's description
    for (const salon of allSalons) {
      // Remove repeated "in Al Ahsa" from English description
      const cleanDescEn: string = salon.descriptionEn ? salon.descriptionEn.replace(/ in Al Ahsa/g, '') : '';
      // Remove repeated "في الأحساء" from Arabic description
      const cleanDescAr: string = salon.descriptionAr ? salon.descriptionAr.replace(/ في الأحساء/g, '') : '';
      
      // Update the salon
      await db.update(salons)
        .set({
          descriptionEn: cleanDescEn,
          descriptionAr: cleanDescAr
        })
        .where(eq(salons.id, salon.id));
    }
    
    console.log('Successfully cleaned up salon descriptions');
  } catch (error) {
    console.error('Error cleaning up salon descriptions:', error);
  }
}

async function updatePureBlissImage(): Promise<void> {
  console.log('Updating Pure Bliss Salon image...');
  try {
    await db.update(salons)
      .set({
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop'
      })
      .where(eq(salons.nameEn, 'Pure Bliss Salon'));
    
    console.log('Successfully updated Pure Bliss Salon image');
  } catch (error) {
    console.error('Error updating Pure Bliss Salon image:', error);
  }
}

async function updateDuplicateImages(): Promise<void> {
  console.log('Updating duplicate salon images...');
  try {
    // Update Chic & Shine image
    await db.update(salons)
      .set({
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop'
      })
      .where(eq(salons.nameEn, 'Chic & Shine'));
    
    // Update Beauty Haven image
    await db.update(salons)
      .set({
        imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1000&auto=format&fit=crop'
      })
      .where(eq(salons.nameEn, 'Beauty Haven'));
    
    console.log('Successfully updated duplicate salon images');
  } catch (error) {
    console.error('Error updating duplicate salon images:', error);
  }
}

async function updateGlamourGraceInfo(): Promise<void> {
  console.log('Updating Glamour & Grace salon information...');
  try {
    await db.update(salons)
      .set({
        nameEn: 'Glamour & Grace',
        nameAr: 'الأناقة والجمال',
        descriptionEn: 'Elegant beauty salon offering premium services',
        descriptionAr: 'صالون تجميل أنيق يقدم خدمات مميزة',
        address: 'King Fahd Road, Al Ahsa',
        city: 'Al Ahsa | الأحساء'
      })
      .where(eq(salons.nameEn, 'Glamour & Grace'));
    
    console.log('Successfully updated Glamour & Grace salon information');
  } catch (error) {
    console.error('Error updating Glamour & Grace salon information:', error);
  }
}