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
  maxTotalBytes?: number;
  maxFiles?: number;
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
const DENIED_SEGMENTS = new Set(['.kube', '.git-credentials', '.netrc', '.pypirc']);

function isSensitivePath(relativePath: string): boolean {
  const parts = normalizePathPosix(relativePath).split('/');
  return parts.some((part, index) => DENIED_SEGMENTS.has(part) || /^id_rsa/.test(part) || /\.(?:pem|key)$/i.test(part) || (part === '.config' && parts[index + 1] === 'gcloud'));
}

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
  if (ext === '.js' || ext === '.css') {
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      if (line.length > 5000) return true;
    }
  }
  return false;
}

export function walkDirectory(targetDir: string, options: WalkerOptions = {}): WalkerResult {
  const maxBytes = options.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES;
  const maxTotalBytes = options.maxTotalBytes ?? Number.POSITIVE_INFINITY;
  const maxFiles = options.maxFiles ?? 100_000;
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
      const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
      ignoreList.push(...lines);
    } catch {
      // ignore
    }
  }

  function globRegex(pattern: string): RegExp {
    let expression = '';
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];
      if (char === '*' && pattern[i + 1] === '*') {
        i++;
        if (pattern[i + 1] === '/') { i++; expression += '(?:.*/)?'; }
        else expression += '.*';
      } else if (char === '*') expression += '[^/]*';
      else if (char === '?') expression += '[^/]';
      else expression += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp(`^${expression}$`);
  }

  function matchesIgnore(relPath: string, isDirectory: boolean): boolean {
    const norm = normalizePathPosix(relPath);
    let ignored = false;
    for (const raw of ignoreList) {
      const negate = raw.startsWith('!');
      let pattern = negate ? raw.slice(1) : raw;
      if (!pattern) continue;
      pattern = pattern.replace(/^\//, '').replace(/\/$/, '');
      const hasSlash = pattern.includes('/');
      const matcher = globRegex(pattern);
      const candidates = hasSlash ? [norm] : norm.split('/');
      if (candidates.some(candidate => matcher.test(candidate)) || (isDirectory && norm.startsWith(`${pattern}/`))) ignored = !negate;
    }
    return ignored;
  }

  const visitedDirectories = new Set<string>();
  const realRoot = fs.realpathSync(targetDir);
  let totalBytes = 0;

  function walk(currentDir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relPath = normalizePathPosix(path.relative(realRoot, fullPath));

      if (isSensitivePath(relPath)) {
        if (!entry.isDirectory()) skippedFiles.ignored++;
        continue;
      }

      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
        continue;
      }
      if (entry.name === '.agentsecurityignore') continue;

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

      let resolvedEntryPath = fullPath;
      if (entry.isSymbolicLink()) {
        try { resolvedEntryPath = fs.realpathSync(fullPath); } catch { continue; }
        const resolvedRelative = path.relative(realRoot, resolvedEntryPath);
        if (resolvedRelative === '..' || resolvedRelative.startsWith(`..${path.sep}`) || path.isAbsolute(resolvedRelative)) continue;
        if (isSensitivePath(normalizePathPosix(resolvedRelative))) {
          if (stat.isFile()) skippedFiles.ignored++;
          continue;
        }
      }

      const directory = stat.isDirectory();
      if (matchesIgnore(relPath, directory) && !directory) {
        skippedFiles.ignored++;
        continue;
      }

      if (stat.isDirectory()) {
        let realDirectory: string;
        try { realDirectory = fs.realpathSync(resolvedEntryPath); } catch { continue; }
        const relativeToRoot = path.relative(realRoot, realDirectory);
        if (relativeToRoot === '..' || relativeToRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeToRoot)) continue;
        if (visitedDirectories.has(realDirectory)) continue;
        visitedDirectories.add(realDirectory);
        walk(resolvedEntryPath);
      } else if (stat.isFile()) {
        if (stat.size > maxBytes) {
          skippedFiles.tooLarge++;
          continue;
        }
        totalBytes += stat.size;
        if (totalBytes > maxTotalBytes) throw new Error('scan exceeds configured size limit');
        if (files.length >= maxFiles) throw new Error('scan exceeds configured file count limit');

        try {
          const buffer = fs.readFileSync(resolvedEntryPath);
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

  visitedDirectories.add(realRoot);
  walk(realRoot);
  return { files, skippedFiles };
}
