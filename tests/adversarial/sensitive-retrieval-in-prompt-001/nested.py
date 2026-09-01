def send_context(user_id):
    record = db.find_one({"_id": user_id})
    return client.chat.completions.create(messages=[{"role": "user", "content": str(record)}])
