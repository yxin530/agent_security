const validated = schema.validate(req.body); db.collection('users').find(validated)
