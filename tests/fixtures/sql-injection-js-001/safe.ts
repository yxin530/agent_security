const q = db.query("SELECT * FROM users WHERE id = ?", [userId]);
export { q };
