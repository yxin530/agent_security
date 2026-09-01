results = collection.query(query_embeddings=[embedding], where={"tenant_id": tenant_id})
allowed = accessControl.filter(results["documents"], user_id)
response = client.chat.completions.create(messages=[{"role": "user", "content": str(allowed)}])
