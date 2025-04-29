import { z } from "@hono/zod-openapi";

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  analyses: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        projectId: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    )
    .optional(),
});

export const createProjectSchema = z.object({
  name: z.string(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type ProjectSchema = z.infer<typeof projectSchema>;
