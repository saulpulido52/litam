const bcrypt = require('bcrypt');

async function generateHash() {
    const password = 'test123';
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);
}

generateHash(); 