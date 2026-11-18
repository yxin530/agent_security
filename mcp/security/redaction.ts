export function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'request failed';
  const safeMessages = new Set([
    'target path is invalid',
    'scan roots are not configured',
    'target path is denied by security policy',
    'target path is outside allowed scan roots',
    'scan contains a denied symlink',
    'scan exceeds configured size limit',
    'runtime event exceeds configured size limit',
    'rules path is not permitted by server configuration',
    'rate limit exceeded',
    'scan queue full',
    'client not authorized',
    'rule was not found',
    'malformed JSON runtime event',
    'invalid runtime event shape',
  ]);
  if (safeMessages.has(message)) return message;
  return 'request failed';
}
