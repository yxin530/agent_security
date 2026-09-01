const secret = await vault.getSecret('api-key'); await callTool('send_request', { url, auth: secret });
