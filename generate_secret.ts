const crypto = require('crypto');

// Generate a 64-byte random string
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('Generated SESSION_SECRET:');
console.log(sessionSecret);
console.log('\nCopy this value and set it as your SESSION_SECRET environment variable.'); 