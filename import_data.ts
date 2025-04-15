import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL || 'postgres://defaultuser:password123@localhost:5432/jamaalaki');

async function importServices() {
  try {
    const fileContent = readFileSync('./sample_services.csv', 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    for (const record of records) {
      await sql`
        INSERT INTO services (
          salon_id, name_en, name_ar, description_en, description_ar,
          price, duration, category
        ) VALUES (
          ${parseInt(record.salon_id)}, ${record.name_en}, ${record.name_ar},
          ${record.description_en}, ${record.description_ar},
          ${parseInt(record.price)}, ${parseInt(record.duration)}, ${record.category}
        )
      `;
    }

    console.log('Successfully imported services data!');
  } catch (error) {
    console.error('Error importing services:', error);
  }
}

async function importReviews() {
  try {
    const fileContent = readFileSync('./sample_reviews.csv', 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    for (const record of records) {
      await sql`
        INSERT INTO reviews (
          user_id, salon_id, rating, comment, created_at
        ) VALUES (
          ${parseInt(record.user_id)}, ${parseInt(record.salon_id)},
          ${parseInt(record.rating)}, ${record.comment}, ${record.created_at}
        )
      `;
    }

    console.log('Successfully imported reviews data!');
  } catch (error) {
    console.error('Error importing reviews:', error);
  }
}

async function importAll() {
  try {
    await importServices();
    await importReviews();
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await sql.end();
  }
}

importAll();
