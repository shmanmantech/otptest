

import sqlite3 from 'sqlite3';
const sqlite = sqlite3.verbose();

const db = new sqlite3.Database('./myDB.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    email TEXT UNIQUE NOT NULL,
    OTP TEXT,
	Created DATETIME,
	AlreadyUsed INTEGER
);`;

db.run(createUsersTable, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Users table ensured.');
    }
});

db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
});
export default db