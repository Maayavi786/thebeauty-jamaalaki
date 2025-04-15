import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { hash } from 'bcrypt';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = neon(process.env.DATABASE_URL!);

async function seedData() {
  try {
    console.log('Starting to seed data...');

    // Create admin user
    const hashedPassword = await hash('password123', 10);
    const admin = await sql`
      INSERT INTO users (username, password, email, full_name, phone, role, preferred_language)
      VALUES ('admin', ${hashedPassword}, 'admin@jamaalaki.com', 'Admin User', '+966501234567', 'admin', 'en')
      RETURNING id;
    `;

    // Create salon owner
    const owner = await sql`
      INSERT INTO users (username, password, email, full_name, phone, role, preferred_language)
      VALUES ('salonowner', ${hashedPassword}, 'owner@jamaalaki.com', 'Salon Owner', '+966502345678', 'salon_owner', 'en')
      RETURNING id;
    `;

    // Create sample customers
    const customers = await sql`
      INSERT INTO users (username, password, email, full_name, phone, role, preferred_language)
      VALUES 
        ('customer1', ${hashedPassword}, 'customer1@jamaalaki.com', 'Customer One', '+966503456789', 'customer', 'en'),
        ('customer2', ${hashedPassword}, 'customer2@jamaalaki.com', 'Customer Two', '+966504567890', 'customer', 'ar'),
        ('customer3', ${hashedPassword}, 'customer3@jamaalaki.com', 'Customer Three', '+966505678901', 'customer', 'en')
      RETURNING id;
    `;

    // Read and parse salons CSV
    const salonsCsv = readFileSync(join(__dirname, '../../sample_salons.csv'), 'utf8');
    const salonsData = parse(salonsCsv, { columns: true, skip_empty_lines: true });

    // Insert salons
    const salons = await sql`
      INSERT INTO salons (owner_id, name_en, name_ar, description_en, description_ar, address, city, phone, email, rating, image_url, is_verified, is_ladies_only, has_private_rooms, is_hijab_friendly, price_range)
      SELECT 
        ${owner[0].id},
        name_en,
        name_ar,
        description_en,
        description_ar,
        address,
        city,
        phone,
        email,
        rating::integer,
        image_url,
        true,
        true,
        true,
        true,
        '$$$'
      FROM json_populate_recordset(null::salons, ${JSON.stringify(salonsData)})
      RETURNING id;
    `;

    // Read and parse services CSV
    const servicesCsv = readFileSync(join(__dirname, '../../sample_services.csv'), 'utf8');
    const servicesData = parse(servicesCsv, { columns: true, skip_empty_lines: true });

    // Insert services
    await sql`
      INSERT INTO services (salon_id, name_en, name_ar, description_en, description_ar, price, duration, category)
      SELECT 
        salon_id::integer,
        name_en,
        name_ar,
        description_en,
        description_ar,
        price::integer,
        duration::integer,
        category
      FROM json_populate_recordset(null::services, ${JSON.stringify(servicesData)})
      RETURNING id;
    `;

    // Read and parse reviews CSV
    const reviewsCsv = readFileSync(join(__dirname, '../../sample_reviews.csv'), 'utf8');
    const reviewsData = parse(reviewsCsv, { columns: true, skip_empty_lines: true });

    // Insert reviews
    await sql`
      INSERT INTO reviews (user_id, salon_id, rating, comment, created_at)
      SELECT 
        user_id::integer,
        salon_id::integer,
        rating::integer,
        comment,
        created_at::timestamp
      FROM json_populate_recordset(null::reviews, ${JSON.stringify(reviewsData)})
      RETURNING id;
    `;

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  }); 