user = db.find_one({"email": user_email})
safe_user = mask(user, fields=["email", "phone"])
client.chat.completions.create(messages=[{"role": "user", "content": str(safe_user)}])
