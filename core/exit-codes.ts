export const ExitCode = {
  OK: 0,
  FINDINGS: 1,
  ERROR: 2
} as const;

export type ExitCode = typeof ExitCode[keyof typeof ExitCode];
