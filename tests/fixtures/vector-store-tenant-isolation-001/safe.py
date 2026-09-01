results = collection.query(query_embeddings=[embedding], where={"tenant_id": tenant_id}, n_results=5)
