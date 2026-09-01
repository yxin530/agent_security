user = db.find_one({"_id": user_id})
client.chat.completions.create(messages=[{"role": "user", "content": str(user)}])
