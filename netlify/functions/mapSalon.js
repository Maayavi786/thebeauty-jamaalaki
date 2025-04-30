import { neon } from '@neondatabase/serverless';
import querystring from 'querystring';

// Netlify function to map a salon to an owner
export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let requestBody;
  try {
    // Check content type and parse request body accordingly
    const contentType = event.headers['content-type'] || '';
    console.log('Content-Type:', contentType);
    
    if (contentType.includes('application/json')) {
      // Parse as JSON
      requestBody = JSON.parse(event.body || '{}');
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Parse as form data
      requestBody = querystring.parse(event.body || '');
    } else {
      // Try to parse as JSON first, then fall back to form data if that fails
      try {
        requestBody = JSON.parse(event.body || '{}');
      } catch (e) {
        requestBody = querystring.parse(event.body || '');
      }
    }
    
    console.log('Received request body:', JSON.stringify(requestBody));
  } catch (parseError) {
    console.error('Failed to parse request body:', parseError, 'Raw body:', event.body);
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Invalid request format',
        details: parseError.message,
        rawBody: event.body && event.body.substring(0, 100) + '...'
      })
    };
  }

  const { username, salonId = 2 } = requestBody;

  if (!username) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Username is required' })
    };
  }

  try {
    // Connect to the database
    const sql = neon(process.env.DATABASE_URL);
    
    console.log(`Attempting to map salon ID ${salonId} to user ${username}`);
    
    // First, get the owner's user ID
    const [user] = await sql`SELECT id, username, role FROM users WHERE username = ${username}`;
    
    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `User with username "${username}" not found` })
      };
    }
    
    console.log(`Found user: ${JSON.stringify(user)}`);
    
    // Update the salon's owner_id
    const result = await sql`
      UPDATE salons 
      SET owner_id = ${user.id} 
      WHERE id = ${salonId} 
      RETURNING id, name_en, name_ar
    `;
    
    if (result.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Salon with ID ${salonId} not found` })
      };
    }
    
    // Check if salon has services
    const services = await sql`SELECT COUNT(*) as count FROM services WHERE salon_id = ${salonId}`;
    
    let serviceMessage = '';
    if (parseInt(services[0].count) === 0) {
      console.log('No services found, adding sample services...');
      
      // Add some sample services
      await sql`
        INSERT INTO services (salon_id, name_en, name_ar, description_en, description_ar, duration, price, category, image_url)
        VALUES 
        (${salonId}, 'Haircut', 'قص شعر', 'Professional haircut and styling', 'قص وتصفيف شعر احترافي', 45, 120, 'Hair', 'https://images.unsplash.com/photo-1560066984-138dadb4c035'),
        (${salonId}, 'Manicure', 'مانيكير', 'Complete nail care and polish', 'العناية الكاملة بالأظافر والطلاء', 30, 80, 'Nails', 'https://images.unsplash.com/photo-1604902396830-aca29e19b067'),
        (${salonId}, 'Facial', 'عناية بالوجه', 'Rejuvenating facial treatment', 'علاج منعش للوجه', 60, 150, 'Skin', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881')
      `;
      
      serviceMessage = '3 sample services were added to the salon.';
    } else {
      serviceMessage = `Salon already has ${services[0].count} services.`;
    }
    
    // Also check if user has correct role
    if (user.role !== 'salon_owner') {
      await sql`UPDATE users SET role = 'salon_owner' WHERE id = ${user.id}`;
      console.log(`Updated user role to salon_owner`);
    }
    
    const responseData = {
      success: true,
      message: `Salon ${result[0].name_en} (ID: ${result[0].id}) successfully mapped to ${username}`,
      serviceMessage,
      salon: {
        id: result[0].id,
        name_en: result[0].name_en,
        name_ar: result[0].name_ar
      },
      userId: user.id
    };
    
    console.log('Sending response:', JSON.stringify(responseData));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseData)
    };
    
  } catch (error) {
    console.error('Error mapping salon:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
