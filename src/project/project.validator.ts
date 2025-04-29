import { z } from "@hono/zod-openapi";

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdById: z.number().nullable(),
  userIds: z.array(z.number()).optional(),
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
  name: z.string().min(1, "Le nom du projet est requis"),
  userIds: z.array(z.number()).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, "Le nom du projet est requis").optional(),
  userIds: z.array(z.number()).optional(),
});

export type ProjectSchema = z.infer<typeof projectSchema>;
