const bcrypt = require('bcrypt');
const password = 'Admin123!';
const hash = bcrypt.hashSync(password, 12);
console.log('Password:', password);
console.log('Hash:', hash);
