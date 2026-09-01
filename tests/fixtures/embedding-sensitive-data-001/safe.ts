await embeddings.create({ input: redact(userRecord, ['email', 'ssn']) });
