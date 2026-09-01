const user = await db.findOne({ id: userId });
const safeUser = redact(user, ['password', 'ssn', 'email']);
await chat({ messages: [{ role: 'user', content: JSON.stringify(safeUser) }] });
