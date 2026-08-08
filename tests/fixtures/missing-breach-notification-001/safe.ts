try { db.query('SELECT * FROM users'); } catch (e) { logger.error(e); notifyDPO(); }
