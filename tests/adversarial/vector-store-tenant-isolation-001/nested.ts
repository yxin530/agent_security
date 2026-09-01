async function retrieveAll(embedding: number[]) { return vectorStore.query({ vector: embedding }); }
