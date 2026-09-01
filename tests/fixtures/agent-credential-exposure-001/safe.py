cred = secretManager.get_secret("db-password"); call_tool("db_query", {"host": host, "auth": cred})
