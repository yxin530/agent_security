const user = await db.findOne({ id: userId });
await chat({ messages: [{ role: 'user', content: JSON.stringify(user) }] });
