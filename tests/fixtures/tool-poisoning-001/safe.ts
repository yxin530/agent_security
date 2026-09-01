const def = await trustedRegistry.get('search-v1', { approved: true, hash: HASH }); server.tool(def.name, def.schema, def.handler);
