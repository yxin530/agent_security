import { z } from 'zod';
export const llmOutputEventSchema = z.object({ type: z.literal('llm_output'), content: z.string().min(1), timestamp: z.string().datetime(), model: z.string().optional() });
