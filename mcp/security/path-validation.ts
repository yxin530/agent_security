import fs from 'node:fs';
import path from 'node:path';

export interface PathPolicy {
  allowedScanRoots: string[];
  maxScanSizeBytes: number;
}

const DENY_SEGMENTS = new Set(['.ssh', '.aws', '.azure', '.gnupg', '.npmrc', '.docker']);

function isDenied(candidate: string): boolean {
  const parts = candidate.split(path.sep);
  return parts.some(part => DENY_SEGMENTS.has(part) || part === '.git');
}

export function validateScanTarget(target: string, policy: PathPolicy): string {
  if (typeof target !== 'string' || target.length === 0 || target.length > 4096) {
    throw new Error('target path is invalid');
  }
  if (policy.allowedScanRoots.length === 0) throw new Error('scan roots are not configured');
  const resolved = fs.realpathSync(target);
  if (isDenied(resolved)) throw new Error('target path is denied by security policy');
  const allowed = policy.allowedScanRoots.some(root => {
    const relative = path.relative(root, resolved);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
  });
  if (!allowed) throw new Error('target path is outside allowed scan roots');
  return resolved;
}

export function preflightScanSize(target: string, policy: PathPolicy): void {
  let total = 0;
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        const real = fs.realpathSync(full);
        if (isDenied(real)) throw new Error('scan contains a denied symlink');
        continue;
      }
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        total += fs.statSync(full).size;
        if (total > policy.maxScanSizeBytes) throw new Error('scan exceeds configured size limit');
      }
    }
  };
  walk(target);
}
