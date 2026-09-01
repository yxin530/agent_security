user = db.find_one({"email": user_email})
client.chat.completions.create(messages=[{"role": "user", "content": str(user)}])
