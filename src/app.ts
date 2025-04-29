import "reflect-metadata";
import { swaggerUI } from "@hono/swagger-ui";
import { initializeDatabase } from "./data-source";
import { OpenAPIHono } from "@hono/zod-openapi";
import { projectRoute } from "./project/project.route";
import { analysisRoute } from "./analysis/analysis.route";

console.log("process.env.PORT", process.env.PORT);

initializeDatabase();

export const app = new OpenAPIHono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/projects", projectRoute);
app.route("/", analysisRoute);

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
