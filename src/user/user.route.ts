import { createRoute, z, OpenAPIHono } from "@hono/zod-openapi";
import { UserController } from "./user.controller";
import {
  userSchema,
  createUserSchema,
  updateUserSchema,
} from "./user.validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "@/middleware/role.middleware";
import { UserRole } from "./user.entity";

const userController = new UserController();

export const userRoute = new OpenAPIHono();

// Protect all methods except POST
userRoute.use("*", authMiddleware({ exclude: ["POST"] }));
userRoute.use(
  "*",
  roleMiddleware({
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    exclude: ["POST"],
  })
);

// Get all users
userRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["User"],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(userSchema),
          },
        },
        description: "Users found",
      },
      403: {
        description: "Unsufficient permissions (required: ADMIN or MANAGER)",
      },
    },
  }),
  userController.findAll
);

// Get user by ID
userRoute.openapi(
  createRoute({
    method: "get",
    path: "/{userId}",
    tags: ["User"],
    request: {
      params: z.object({
        userId: z.string(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
        description: "User found",
      },
      403: {
        description: "Unsufficient permissions (required: ADMIN or MANAGER)",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  userController.findById
);

// Create user
userRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["User"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createUserSchema,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
        description: "User created",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  userController.create
);

// Update user
userRoute.openapi(
  createRoute({
    method: "put",
    path: "/{userId}",
    tags: ["User"],
    request: {
      params: z.object({
        userId: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: updateUserSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
        description: "User updated",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Unsufficient permissions (required: ADMIN or MANAGER)",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  userController.update
);

// Delete user
userRoute.openapi(
  createRoute({
    method: "delete",
    path: "/{userId}",
    tags: ["User"],
    request: {
      params: z.object({
        userId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "User deleted",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Unsufficient permissions (required: ADMIN or MANAGER)",
      },
      404: {
        description: "User not found",
      },
    },
  }),
  userController.delete
);
