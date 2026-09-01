const hits = await pinecone.query({ vector: queryVec });
const prompt = hits.chunks.join(' ');
const completion = await openai.chat({ messages: [{ role: 'user', content: prompt }] });
