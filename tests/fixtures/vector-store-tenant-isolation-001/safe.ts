const results = await vectorStore.query({ vector: embedding, filter: { tenantId: ctx.tenantId } });
