function load() { if ($id) { $db->query("SELECT * FROM users WHERE id = " . $id); } }
