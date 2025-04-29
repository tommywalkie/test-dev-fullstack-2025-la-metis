import { Context, Next } from "hono";
import { AppDataSource } from "../data-source";
import { User } from "../user/user.entity";

export type AuthOptions = {
  /** Methods to protect */
  methods?: string[];
  /** Methods to exclude */
  exclude?: string[];
};

/**
 * Middleware to protect routes
 * @param options - Options for the middleware
 * @returns Middleware function
 */
export const authMiddleware = (options: AuthOptions = {}) => {
  const protectedMethods = options.methods || [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];
  const excludedMethods = options.exclude || [];

  return async (c: Context, next: Next) => {
    const method = c.req.method;

    // Vérifier si la méthode doit être protégée
    const shouldProtect =
      protectedMethods.includes(method) && !excludedMethods.includes(method);

    if (!shouldProtect) {
      return next();
    }

    const userId = c.req.header("X-User-ID");

    if (!userId) {
      return c.json({ message: "User ID not provided" }, 401);
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: parseInt(userId) });

    if (!user) {
      return c.json({ message: "User not found" }, 401);
    }

    c.set("user", user);

    await next();
  };
};
