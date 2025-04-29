import { Context, Next } from "hono";
import { User, UserRole } from "../user/user.entity";

export type RoleOptions = {
  /** Roles allowed to access the route */
  roles: UserRole[];
  /** Methods to protect */
  methods?: string[];
  /** Methods to exclude */
  exclude?: string[];
};

/**
/**
 * Middleware to check user roles
 * @param options - Options for the middleware
 * @returns Middleware function
 */
export const roleMiddleware = (options: RoleOptions) => {
  const allowedRoles = options.roles;
  const protectedMethods = options.methods || [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];
  const excludedMethods = options.exclude || [];

  return async (c: Context, next: Next) => {
    // Check if the method should be protected
    const method = c.req.method;

    // Skip role check if method is excluded or not in protected methods
    if (
      excludedMethods.includes(method) ||
      (options.methods && !protectedMethods.includes(method))
    ) {
      return next();
    }

    // Get the user from the context (set by authMiddleware)
    const user = c.get("user") as User | undefined;

    if (!user) {
      return c.json(
        { message: "Authentication required before role check" },
        401
      );
    }

    // Check if the user has one of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          message: "Insufficient permissions",
          required: allowedRoles,
          current: user.role,
        },
        403
      );
    }

    await next();
  };
};
