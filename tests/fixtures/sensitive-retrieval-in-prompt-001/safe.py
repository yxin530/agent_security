user = db.find_one({"_id": user_id})
safe_user = mask(user, fields=["email", "phone"])
client.chat.completions.create(messages=[{"role": "user", "content": str(safe_user)}])
