import { z } from "@hono/zod-openapi";
import { UserRole } from "./user.entity";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createUserSchema = z.object({
  name: z.string(),
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = createUserSchema.partial();

export type UserSchema = z.infer<typeof userSchema>;
