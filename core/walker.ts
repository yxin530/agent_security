import * as fs from 'fs';
import * as path from 'path';
import { normalizePathPosix } from './findings';

export interface SkippedFiles {
  tooLarge: number;
  binary: number;
  minified: number;
  ignored: number;
}

export interface WalkerOptions {
  maxFileBytes?: number;
  followSymlinks?: boolean;
}

export interface WalkedFile {
  fullPath: string;
  relativePath: string;
  size: number;
}

export interface WalkerResult {
  files: WalkedFile[];
  skippedFiles: SkippedFiles;
}

const DEFAULT_MAX_FILE_BYTES = 1024 * 1024; // 1 MB

export function isBinaryBuffer(buf: Buffer): boolean {
  // Check first 8000 bytes for null character
  const len = Math.min(buf.length, 8000);
  for (let i = 0; i < len; i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

export function isMinifiedFile(filePath: string, content: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.js' || ext === '.css' || ext === '.mjs' || ext === '.cjs') {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      if (line.length > 5000) return true;
    }
  }
  return false;
}

export function walkDirectory(targetDir: string, options: WalkerOptions = {}): WalkerResult {
  const maxBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  const followSymlinks = options.followSymlinks ?? false;

  const files: WalkedFile[] = [];
  const skippedFiles: SkippedFiles = {
    tooLarge: 0,
    binary: 0,
    minified: 0,
    ignored: 0
  };

  const ignoreList: string[] = [];
  const ignoreFilePath = path.join(targetDir, '.agentsecurityignore');
  if (fs.existsSync(ignoreFilePath)) {
    try {
      const content = fs.readFileSync(ignoreFilePath, 'utf8');
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      ignoreList.push(...lines);
    } catch {
      // ignore
    }
  }

  function matchesIgnore(relPath: string): boolean {
    const norm = normalizePathPosix(relPath);
    for (const pattern of ignoreList) {
      // Simple gitignore style matching
      const cleanPattern = pattern.startsWith('/') ? pattern.slice(1) : pattern;
      if (norm === cleanPattern || norm.startsWith(cleanPattern + '/') || norm.endsWith('/' + cleanPattern)) {
        return true;
      }
    }
    return false;
  }

  function walk(currentDir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = normalizePathPosix(path.relative(targetDir, fullPath));

      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
        continue;
      }

      if (matchesIgnore(relPath)) {
        skippedFiles.ignored++;
        continue;
      }

      if (entry.isSymbolicLink()) {
        if (!followSymlinks) {
          continue;
        }
      }

      let stat: fs.Stats;
      try {
        stat = followSymlinks ? fs.statSync(fullPath) : fs.lstatSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        if (stat.size > maxBytes) {
          skippedFiles.tooLarge++;
          continue;
        }

        try {
          const buffer = fs.readFileSync(fullPath);
          if (isBinaryBuffer(buffer)) {
            skippedFiles.binary++;
            continue;
          }

          const text = buffer.toString('utf8');
          if (isMinifiedFile(fullPath, text)) {
            skippedFiles.minified++;
            continue;
          }

          files.push({
            fullPath,
            relativePath: relPath,
            size: stat.size
          });
        } catch {
          // unable to read file
        }
      }
    }
  }

  walk(targetDir);
  return { files, skippedFiles };
}
