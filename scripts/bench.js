const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { scanDetailedInWorkers } = require('../dist/core/scan-session');

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-bench-'));
  const content = `${' '.repeat(2559)}\n${' '.repeat(2560)}`;
  const files = 10_000;
  const workers = Number(process.env.AGENT_SECURITY_BENCH_WORKERS ?? 4);
  try {
    for (let index = 0; index < files; index++) {
      fs.writeFileSync(path.join(root, `source-${String(index).padStart(5, '0')}.ts`), content);
    }
    const started = performance.now();
    const result = await scanDetailedInWorkers(path.resolve(__dirname, '..', 'dist', 'rules'), root, { timeoutMs: 120_000, workers });
    const durationMs = Math.round(performance.now() - started);
    const peakRssMb = Math.round(process.memoryUsage().rss / (1024 * 1024));
    const bytes = files * Buffer.byteLength(content);
    const report = { files: result.scannedFiles, bytes, workers, durationMs, peakRssMb, findings: result.findings.length, truncated: result.truncated };
    console.log(JSON.stringify(report, null, 2));
    if (result.truncated || result.scannedFiles !== files || durationMs > 20_000 || peakRssMb > 512) process.exitCode = 1;
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
