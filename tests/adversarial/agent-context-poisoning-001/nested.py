def handle(req): agent_memory.write("last_input", req.json["message"])
