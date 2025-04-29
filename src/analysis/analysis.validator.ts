import { z } from "zod";

export const createAnalysisSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateAnalysisDto = z.infer<typeof createAnalysisSchema>;

export const analysisSchema = z.object({
  id: z.number(),
  name: z.string(),
  projectId: z.number(),
});

export type AnalysisSchema = z.infer<typeof analysisSchema>;
