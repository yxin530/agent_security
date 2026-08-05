func load() { if id != "" { db.Query("SELECT * FROM users WHERE id = " + id) } }
