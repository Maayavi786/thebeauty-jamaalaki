import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL || 'postgres://defaultuser:password123@localhost:5432/jamaalaki');

async function importProductionData() {
  try {
    console.log('Starting production data import...');
    
    // Read and parse the CSV files
    const salonsContent = readFileSync('./sample_salons.csv', 'utf-8');
    const servicesContent = readFileSync('./sample_services.csv', 'utf-8');
    const reviewsContent = readFileSync('./sample_reviews.csv', 'utf-8');

    const salons = parse(salonsContent, { columns: true, skip_empty_lines: true });
    const services = parse(servicesContent, { columns: true, skip_empty_lines: true });
    const reviews = parse(reviewsContent, { columns: true, skip_empty_lines: true });

    // Import salons
    console.log('Importing salons...');
    for (const salon of salons) {
      await sql`
        INSERT INTO salons (
          owner_id, name_en, name_ar, description_en, description_ar,
          address, city, phone, email, rating, image_url
        ) VALUES (
          ${parseInt(salon.owner_id)}, ${salon.name_en}, ${salon.name_ar},
          ${salon.description_en}, ${salon.description_ar}, ${salon.address},
          ${salon.city}, ${salon.phone}, ${salon.email},
          ${parseInt(salon.rating)}, ${salon.image_url}
        )
      `;
    }
    console.log('Salons imported successfully!');

    // Import services
    console.log('Importing services...');
    for (const service of services) {
      await sql`
        INSERT INTO services (
          salon_id, name_en, name_ar, description_en, description_ar,
          price, duration, category
        ) VALUES (
          ${parseInt(service.salon_id)}, ${service.name_en}, ${service.name_ar},
          ${service.description_en}, ${service.description_ar}, ${parseFloat(service.price)},
          ${parseInt(service.duration)}, ${service.category}
        )
      `;
    }
    console.log('Services imported successfully!');

    // Import reviews
    console.log('Importing reviews...');
    for (const review of reviews) {
      await sql`
        INSERT INTO reviews (
          salon_id, user_id, rating, comment_en, comment_ar
        ) VALUES (
          ${parseInt(review.salon_id)}, ${parseInt(review.user_id)},
          ${parseInt(review.rating)}, ${review.comment_en}, ${review.comment_ar}
        )
      `;
    }
    console.log('Reviews imported successfully!');

    console.log('All data imported successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

importProductionData(); 