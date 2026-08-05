export function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'request failed';
  if (/path|root|scan|event|rule|configuration|denied|limit/i.test(message)) return message;
  return 'request failed';
}
