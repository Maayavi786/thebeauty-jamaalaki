-- Create enums
CREATE TYPE user_role AS ENUM ('customer', 'salon_owner', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create salons table
CREATE TABLE salons (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    rating INTEGER,
    image_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_ladies_only BOOLEAN NOT NULL DEFAULT true,
    has_private_rooms BOOLEAN NOT NULL DEFAULT false,
    is_hijab_friendly BOOLEAN NOT NULL DEFAULT false,
    price_range TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER NOT NULL REFERENCES salons(id),
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    duration INTEGER NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT
);

-- Create bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    salon_id INTEGER NOT NULL REFERENCES salons(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    datetime TIMESTAMP NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    points_earned INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    salon_id INTEGER NOT NULL REFERENCES salons(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
); 