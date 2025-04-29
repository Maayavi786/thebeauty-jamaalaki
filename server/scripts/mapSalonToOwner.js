// Script to map an existing salon to a salon owner
const { db, salons } = require('../db');
const { eq } = require('drizzle-orm');
const { neon } = require('@neondatabase/serverless');

// Configuration
const SALON_ID = 2; // Salon ID to map
const OWNER_USERNAME = process.argv[2]; // Username of the salon owner

// Exit if no username provided
if (!OWNER_USERNAME) {
  console.error('ERROR: Please provide the salon owner username as an argument');
  console.error('Usage: node mapSalonToOwner.js <username>');
  process.exit(1);
}

async function mapSalonToOwner() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // First, get the owner's user ID
    const [user] = await sql`SELECT id FROM users WHERE username = ${OWNER_USERNAME}`;
    
    if (!user) {
      console.error(`User with username "${OWNER_USERNAME}" not found`);
      process.exit(1);
    }
    
    console.log(`Found user with ID ${user.id}`);
    
    // Update the salon's owner_id
    const result = await sql`
      UPDATE salons 
      SET owner_id = ${user.id} 
      WHERE id = ${SALON_ID} 
      RETURNING id, name_en, name_ar
    `;
    
    if (result.length === 0) {
      console.error(`Salon with ID ${SALON_ID} not found`);
      process.exit(1);
    }
    
    console.log(`Success! Salon ${result[0].name_en} (ID: ${result[0].id}) now belongs to ${OWNER_USERNAME}`);
    
    // Also add some sample services if needed
    console.log('Checking if salon has services...');
    const services = await sql`SELECT COUNT(*) as count FROM services WHERE salon_id = ${SALON_ID}`;
    
    if (services[0].count === 0) {
      console.log('No services found, adding sample services...');
      
      // Add some sample services
      await sql`
        INSERT INTO services (salon_id, name_en, name_ar, description_en, description_ar, duration, price, category, image_url)
        VALUES 
        (${SALON_ID}, 'Haircut', 'قص شعر', 'Professional haircut and styling', 'قص وتصفيف شعر احترافي', 45, 120, 'Hair', 'https://images.unsplash.com/photo-1560066984-138dadb4c035'),
        (${SALON_ID}, 'Manicure', 'مانيكير', 'Complete nail care and polish', 'العناية الكاملة بالأظافر والطلاء', 30, 80, 'Nails', 'https://images.unsplash.com/photo-1604902396830-aca29e19b067'),
        (${SALON_ID}, 'Facial', 'عناية بالوجه', 'Rejuvenating facial treatment', 'علاج منعش للوجه', 60, 150, 'Skin', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881')
      `;
      
      console.log('Sample services added!');
    } else {
      console.log(`Salon already has ${services[0].count} services`);
    }
    
    console.log('Operation completed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

mapSalonToOwner();
