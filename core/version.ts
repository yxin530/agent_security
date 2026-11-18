import * as fs from 'fs';
import * as path from 'path';

let cachedVersion: string | null = null;

export function getVersion(): string {
  if (cachedVersion) return cachedVersion;
  let dir = __dirname;
  for (let i = 0; i < 4; i++) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.version) {
          cachedVersion = pkg.version;
          return pkg.version;
        }
      } catch {
        // ignore and keep searching
      }
    }
    dir = path.dirname(dir);
  }
  return '0.10.0';
}

export const ENGINE_VERSION = getVersion();
