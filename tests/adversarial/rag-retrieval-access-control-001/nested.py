def build_prompt(embedding):
    retrieved = collection.query(query_embeddings=[embedding])
    context = "\n".join(retrieved["documents"][0])
    return client.chat.completions.create(messages=[{"role": "user", "content": context}])
