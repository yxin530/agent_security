async function runAgent() { while (agent.isRunning()) { await agent.step(); } }
