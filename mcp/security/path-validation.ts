import fs from 'node:fs';
import path from 'node:path';
import { walkDirectory } from '../../core/walker';

export interface PathPolicy {
  allowedScanRoots: string[];
  maxScanSizeBytes: number;
}

const DENY_SEGMENTS = new Set(['.ssh', '.aws', '.azure', '.gnupg', '.npmrc', '.docker', '.kube', '.git-credentials', '.netrc', '.pypirc']);

function isDenied(candidate: string): boolean {
  const parts = candidate.split(path.sep);
  return parts.some((part, index) => DENY_SEGMENTS.has(part) || part === '.git' || /^id_rsa/.test(part) || /\.(?:pem|key)$/i.test(part) || (part === '.config' && parts[index + 1] === 'gcloud'));
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
  walkDirectory(target, { maxTotalBytes: policy.maxScanSizeBytes });
}
