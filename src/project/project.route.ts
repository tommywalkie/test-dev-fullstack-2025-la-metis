import { createRoute, z, OpenAPIHono } from "@hono/zod-openapi";
import { ProjectController } from "./project.controller";
import {
  projectSchema,
  createProjectSchema,
  updateProjectSchema,
} from "./project.validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "@/middleware/role.middleware";
import { UserRole } from "@/user/user.entity";

const projectController = new ProjectController();

export const projectRoute = new OpenAPIHono();

// Apply authentication and role middleware to all project routes
// Limitation: Also affects analysis routes
projectRoute.use("*", authMiddleware());
projectRoute.use(
  "*",
  roleMiddleware({
    roles: [UserRole.ADMIN, UserRole.MANAGER],
    exclude: ["GET"],
  })
);

// Get all projects
projectRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Project"],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(projectSchema),
          },
        },
        description: "Projects found",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  projectController.findAll
);

// Get project by ID
projectRoute.openapi(
  createRoute({
    method: "get",
    path: "/{projectId}",
    tags: ["Project"],
    request: {
      params: z.object({
        projectId: z.string(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: projectSchema,
          },
        },
        description: "Project found",
      },
      401: {
        description: "Unauthorized",
      },
      404: {
        description: "Project not found",
      },
    },
  }),
  projectController.findById
);

// Create project
projectRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Project"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: createProjectSchema,
          },
        },
      },
    },
    responses: {
      201: {
        content: {
          "application/json": {
            schema: projectSchema,
          },
        },
        description: "Project created",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  projectController.create
);

// Update project
projectRoute.openapi(
  createRoute({
    method: "put",
    path: "/{projectId}",
    tags: ["Project"],
    request: {
      params: z.object({
        projectId: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: updateProjectSchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: projectSchema,
          },
        },
        description: "Project updated",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "Project not found",
      },
    },
  }),
  projectController.update
);

// Delete project
projectRoute.openapi(
  createRoute({
    method: "delete",
    path: "/{projectId}",
    tags: ["Project"],
    request: {
      params: z.object({
        projectId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Project deleted",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Forbidden",
      },
      404: {
        description: "Project not found",
      },
    },
  }),
  projectController.delete
);
