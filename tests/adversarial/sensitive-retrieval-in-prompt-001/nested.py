def send_context(user_id):
    record = db.find_one({"email": user_email})
    return client.chat.completions.create(messages=[{"role": "user", "content": str(record)}])
