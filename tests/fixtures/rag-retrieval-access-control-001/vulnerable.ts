const results = await vectorStore.query({ vector: embedding });
const response = await chat({ messages: [{ role: 'user', content: results.docs }] });
