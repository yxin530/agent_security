export interface Limits { maxScanSizeBytes: number; scanTimeoutMs: number; maxEventBytes: number; }
export const DEFAULT_LIMITS: Limits = { maxScanSizeBytes: 50_000_000, scanTimeoutMs: 30_000, maxEventBytes: 1_000_000 };
