import { parentPort, workerData } from 'node:worker_threads';
import { inspectRuntimeEventInline, RuntimeEvent } from './index';

try {
  const { rulesDir, event, ruleIds } = workerData as { rulesDir: string; event: RuntimeEvent; ruleIds?: string[] };
  const findings = inspectRuntimeEventInline(rulesDir, event, ruleIds);
  parentPort?.postMessage({ findings });
} catch (error) {
  parentPort?.postMessage({ error: (error as Error).message || 'runtime event scan failed' });
}
