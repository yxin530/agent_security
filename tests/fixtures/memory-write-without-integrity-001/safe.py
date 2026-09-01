persistent_memory.save({"content": thought, "author": agent_id, "timestamp": time.time(), "checksum": hashlib.sha256(thought.encode()).hexdigest()})
