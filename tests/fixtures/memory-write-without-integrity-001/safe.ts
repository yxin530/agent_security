longTermMemory.store({ content: thought, author: agentId, timestamp: Date.now(), hash: sha256(thought) });
