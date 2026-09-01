async function buildPrompt(embedding: number[]) {
  const retrieved = await vectorStore.query({ vector: embedding });
  const context = retrieved.docs.map((d: any) => d.text).join('\n');
  return chat({ messages: [{ role: 'user', content: context }] });
}
