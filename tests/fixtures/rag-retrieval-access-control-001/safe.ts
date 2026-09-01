const results = await vectorStore.query({ vector: embedding, filter: { tenantId } });
const allowed = await accessControl.filter(results.docs, userId);
const response = await chat({ messages: [{ role: 'user', content: allowed }] });
