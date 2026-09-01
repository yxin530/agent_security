while (agent.isRunning() && steps < maxSteps) { await agent.step(); steps++; }
