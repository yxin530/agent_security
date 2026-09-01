results = collection.query(query_embeddings=[embedding])
response = client.chat.completions.create(messages=[{"role": "user", "content": str(results["documents"])}])
