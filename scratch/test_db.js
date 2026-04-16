const Database = require('better-sqlite3');
const db = new Database(':memory:');
console.log('Successfully loaded better-sqlite3');
db.close();
