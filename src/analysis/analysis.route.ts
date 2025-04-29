import { createRoute, z, OpenAPIHono } from "@hono/zod-openapi";
import { AnalysisController } from "./analysis.controller";
import { analysisSchema, createAnalysisSchema } from "./analysis.validator";

const analysisController = new AnalysisController();

export const analysisRoute = new OpenAPIHono();

analysisRoute.openapi(
  createRoute({
    method: "get",
    tags: ["Analysis"],
    path: "/projects/{projectId}/analyses",
    summary: "Get all project analyses",
    request: {
      params: z.object({
        projectId: z.string(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(analysisSchema),
          },
        },
        description: "Project analyses found",
      },
    },
  }),
  analysisController.findAll
);

analysisRoute.openapi(
  createRoute({
    method: "get",
    tags: ["Analysis"],
    path: "/projects/{projectId}/analyses/{analysisId}",
    summary: "Get a project analysis by ID",
    request: {
      params: z.object({
        projectId: z.string(),
        analysisId: z.string(),
      }),
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: analysisSchema,
          },
        },
        description: "Project analysis found",
      },
      404: {
        description: "Project analysis not found",
      },
    },
  }),
  analysisController.findById
);

analysisRoute.openapi(
  createRoute({
    method: "post",
    tags: ["Analysis"],
    path: "/projects/{projectId}/analyses",
    summary: "Create a new project analysis",
    request: {
      params: z.object({
        projectId: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: createAnalysisSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Project analysis created",
      },
    },
  }),
  analysisController.create
);

analysisRoute.openapi(
  createRoute({
    method: "put",
    tags: ["Analysis"],
    path: "/projects/{projectId}/analyses/{analysisId}",
    summary: "Update a project analysis by ID",
    request: {
      params: z.object({
        projectId: z.string(),
        analysisId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Project analysis updated",
      },
    },
  }),
  analysisController.update
);

analysisRoute.openapi(
  createRoute({
    method: "delete",
    tags: ["Analysis"],
    path: "/projects/{projectId}/analyses/{analysisId}",
    summary: "Delete a project analysis by ID",
    request: {
      params: z.object({
        projectId: z.string(),
        analysisId: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Project analysis deleted",
      },
      404: {
        description: "Project analysis not found",
      },
    },
  }),
  analysisController.delete
);
