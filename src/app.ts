import "reflect-metadata";
import { swaggerUI } from "@hono/swagger-ui";
import { initializeDatabase } from "./data-source";
import { OpenAPIHono } from "@hono/zod-openapi";

initializeDatabase();

export const app = new OpenAPIHono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/projects", (c) => {
  return c.json([]);
});

app.get("/projects/:projectId", (c) => {
  const { projectId } = c.req.param();

  return c.json({
    projectId,
  });
});

app.post("/projects/", async (c) => {
  const body = await c.req.json();

  console.log(body);

  return c.json({
    success: true,
  });
});

//

app.get("/projects/:projectId/analyses", (c) => {
  const { projectId } = c.req.param();

  return c.json([]);
});

app.get("/projects/:projectId/analyses/:analysisId", (c) => {
  const { analysisId } = c.req.param();

  return c.json({
    analysisId,
  });
});

app.post("/projects/:projectId/analyses", async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();

  console.log(body);

  return c.json({
    success: true,
  });
});

// Configure OpenAPI with JWT authentication
app.get("/openapi.json", (c) => {
  const spec = app.getOpenAPIDocument({
    openapi: "3.1.0",
    info: {
      title: "API Documentation",
      version: "v1",
    },
  });

  spec.components = {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  };

  spec.security = [{ bearerAuth: [] }];

  return c.json(spec);
});

// Mount Swagger UI
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
    persistAuthorization: true,
  })
);
