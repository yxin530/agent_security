import { z } from 'zod';
export const llmInputEventSchema = z.object({ type: z.literal('llm_input'), content: z.string().min(1), timestamp: z.string().datetime(), context: z.unknown().optional() });
