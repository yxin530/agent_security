import { z } from 'zod';
export const toolCallEventSchema = z.object({ type: z.literal('tool_call'), name: z.string().min(1), args: z.record(z.unknown()), timestamp: z.string().datetime(), data: z.string().optional() });
