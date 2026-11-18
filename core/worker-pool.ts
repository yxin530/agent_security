import * as os from 'node:os';
import * as path from 'node:path';
import { Worker } from 'node:worker_threads';
import { Rule } from '../engine/loader';
import { Finding, sortFindings } from './findings';
import { WalkedFile } from './walker';

export interface WorkerScanResult { findings: Finding[]; scannedFiles: number; truncated: boolean; }

export async function scanFilesInWorkers(
  rules: Rule[], files: WalkedFile[], options: { timeoutMs?: number; workers?: number } = {}
): Promise<WorkerScanResult> {
  if (!files.length) return { findings: [], scannedFiles: 0, truncated: false };
  const requestedWorkers = options.workers ?? Math.min(4, Math.max(1, os.cpus().length - 1));
  if (!Number.isInteger(requestedWorkers) || requestedWorkers < 1 || requestedWorkers > 32) {
    throw new Error('workers must be an integer from 1 to 32');
  }
  const count = Math.min(requestedWorkers, files.length);
  const buckets = Array.from({ length: count }, () => [] as WalkedFile[]);
  files.forEach((file, index) => buckets[index % count].push(file));

  const findings: Finding[] = [];
  let scannedFiles = 0;
  let truncated = false;
  const workers: Worker[] = [];
  let settled = false;
  let resolveAll!: () => void;
  let rejectAll!: (error: Error) => void;
  const all = new Promise<void>((resolve, reject) => { resolveAll = resolve; rejectAll = reject; });
  let remaining = count;
  const onWorkerExit = (code: number) => {
    if (settled) return;
    remaining--;
    if (code !== 0 && !truncated) rejectAll(new Error('scan worker exited unexpectedly'));
    else if (remaining === 0) resolveAll();
  };

  for (const bucket of buckets) {
    const worker = new Worker(path.join(__dirname, 'scan-worker.js'), {
      workerData: { rules, files: bucket.map(({ fullPath, relativePath }) => ({ fullPath, relativePath })) }
    });
    workers.push(worker);
    worker.on('message', (message: { findings?: Finding[]; scannedFiles?: number; done?: boolean }) => {
      if (settled) return;
      if (message.findings) findings.push(...message.findings);
      if (message.scannedFiles) scannedFiles += message.scannedFiles;
    });
    worker.once('error', rejectAll);
    worker.once('exit', onWorkerExit);
  }

  const timeoutMs = options.timeoutMs;
  const timer = timeoutMs === undefined ? undefined : setTimeout(() => {
    if (settled) return;
    truncated = true;
    void Promise.all(workers.map(worker => worker.terminate())).then(() => {
      if (!settled) { settled = true; resolveAll(); }
    });
  }, timeoutMs);

  try { await all; }
  catch (error) {
    settled = true;
    await Promise.all(workers.map(worker => worker.terminate()));
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
  settled = true;
  return { findings: sortFindings(findings), scannedFiles, truncated };
}
