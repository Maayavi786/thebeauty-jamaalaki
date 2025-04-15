import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL || 'postgres://defaultuser:password123@localhost:5432/jamaalaki');

async function importSalons() {
  try {
    // Read and parse the CSV file
    const fileContent = readFileSync('./sample_salons.csv', 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Insert each salon into the database
    for (const record of records) {
      await sql`
        INSERT INTO salons (
          owner_id, name_en, name_ar, description_en, description_ar,
          address, city, phone, email, rating, image_url
        ) VALUES (
          ${parseInt(record.owner_id)}, ${record.name_en}, ${record.name_ar},
          ${record.description_en}, ${record.description_ar}, ${record.address},
          ${record.city}, ${record.phone}, ${record.email},
          ${parseInt(record.rating)}, ${record.image_url}
        )
      `;
    }

    console.log('Successfully imported salons data!');
  } catch (error) {
    console.error('Error importing salons:', error);
  } finally {
    await sql.end();
  }
}

importSalons();
