hits = qdrant.search(query_vector=vec)
prompt = [{"role": "user", "content": str(hits)}]
reply = openai.ChatCompletion.create(model="gpt-4", messages=prompt)
