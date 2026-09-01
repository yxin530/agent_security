def get_docs(embedding): return collection.query(query_embeddings=[embedding], n_results=5)
