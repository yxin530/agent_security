profile = getUserById(user_id=uid)
context = [{"role": "system", "content": str(profile)}]
openai.ChatCompletion.create(model="gpt-4", messages=context)
