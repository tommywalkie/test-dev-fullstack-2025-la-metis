import "reflect-metadata";
import { swaggerUI } from "@hono/swagger-ui";
import { initializeDatabase } from "./data-source";
import { OpenAPIHono } from "@hono/zod-openapi";
import { projectRoute } from "./project/project.route";
import { analysisRoute } from "./analysis/analysis.route";
import { userRoute } from "./user/user.route";

initializeDatabase();

export const app = new OpenAPIHono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/projects", projectRoute);
app.route("/", analysisRoute);
app.route("/users", userRoute);

// Configure OpenAPI with JWT authentication
app.get("/openapi.json", (c) => {
  const spec = app.getOpenAPIDocument({
    openapi: "3.1.0",
    info: {
      title: "API Documentation",
      version: "v1",
    },
  });

  // Tell Swagger that we use the X-User-ID header for authentication
  spec.components = {
    securitySchemes: {
      userIdAuth: {
        type: "apiKey",
        in: "header",
        name: "X-User-ID",
        description: "User identifier for simulated authentication",
      },
    },
  };

  // Make Swagger actually send the X-User-ID header on requests
  spec.security = [
    {
      userIdAuth: [],
    },
  ];

  return c.json(spec);
});

// Mount Swagger UI
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  })
);
