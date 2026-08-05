function load() { if (userId) { db.query(`SELECT * FROM users WHERE id = ${userId}`); } }
