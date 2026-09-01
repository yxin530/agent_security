const user = await db.findOne({ email: userEmail });
const safeUser = redact(user, ['password', 'ssn', 'email']);
await chat({ messages: [{ role: 'user', content: JSON.stringify(safeUser) }] });
