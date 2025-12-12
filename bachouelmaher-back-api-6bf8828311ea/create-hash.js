// create-hash.js
const bcrypt = require('bcryptjs');

async function createHash() {
  const password = 'admin123'; // Your desired password
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Hashed password:', hashedPassword);
  
  // Verify it works
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password verification:', isValid);
}

createHash();