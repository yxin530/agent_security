async function buildContext(userId: string) {
  const record = await db.findOne({ id: userId });
  return chat({ messages: [{ role: 'user', content: JSON.stringify(record) }] });
}
