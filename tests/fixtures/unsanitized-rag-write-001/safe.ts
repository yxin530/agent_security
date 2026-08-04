vectorStore.upsert({ text: sanitize(req.body.content), provenance: 'verified' });
