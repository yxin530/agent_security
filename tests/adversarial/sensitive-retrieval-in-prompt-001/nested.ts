async function buildContext(userId: string) {
  const record = await db.findOne({ email: userEmail });
  return chat({ messages: [{ role: 'user', content: JSON.stringify(record) }] });
}
