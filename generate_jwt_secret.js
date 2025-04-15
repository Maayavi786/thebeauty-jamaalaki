import crypto from 'crypto';

// Generate a 32-byte random string for JWT
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Generated JWT_SECRET:');
console.log(jwtSecret);
console.log('\nCopy this value and set it as your JWT_SECRET environment variable.'); 