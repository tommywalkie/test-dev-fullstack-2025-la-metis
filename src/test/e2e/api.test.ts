import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import supertest from "supertest";
import { Project } from "@/project/project.entity";
import { startServer, stopServer, wait } from "./server";

const API_URL = `http://localhost:${process.env.PORT}`;

// Start the server before all tests
beforeAll(async () => {
  await startServer();
});

// Stop the server after all tests
afterAll(async () => {
  await stopServer();
  // Additional wait to ensure port is released
  await wait(2000);
});

// Add a separator between tests for better readability
beforeEach(async () => {
  await wait(100); // Small delay between tests
});

describe("API E2E Tests", () => {
  // Test the root endpoint
  it("should respond to the root endpoint", async () => {
    const response = await supertest(API_URL).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello Hono!");
  });

  // Test the OpenAPI documentation endpoint
  it("should serve OpenAPI documentation", async () => {
    const response = await supertest(API_URL).get("/openapi.json");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("openapi");
    expect(response.body).toHaveProperty("info");
    expect(response.body).toHaveProperty("paths");
  });

  // Test the Swagger UI endpoint
  it("should serve Swagger UI", async () => {
    const response = await supertest(API_URL).get("/docs");
    expect(response.status).toBe(200);
    expect(response.text).toContain("swagger");
  });

  // Test the projects endpoint
  describe("Projects API", () => {
    // Generate a unique project name for testing
    const uniqueProjectName = `Test Project ${Date.now()}`;

    it("should create a project and find it in the list", async () => {
      // Create a project with a unique name
      const newProject = {
        name: uniqueProjectName,
      };

      // Create the project
      const createResponse = await supertest(API_URL)
        .post("/projects")
        .send(newProject)
        .set("Content-Type", "application/json");

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty("id");

      // Get the list of all projects
      const listResponse = await supertest(API_URL).get("/projects");
      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);

      // Find our project in the list
      const foundProject = listResponse.body.find(
        (project: Project) => project.name === uniqueProjectName
      );
      expect(foundProject).toBeDefined();
      expect(foundProject.id).toBe(createResponse.body.id);
    });

    it("should list projects", async () => {
      const response = await supertest(API_URL).get("/projects");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should create a new project", async () => {
      const newProject = {
        name: "Test Project",
      };

      const response = await supertest(API_URL)
        .post("/projects")
        .send(newProject)
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newProject.name);
    });

    it("should get a project by ID", async () => {
      // First create a project
      const createResponse = await supertest(API_URL).post("/projects").send({
        name: "Project to Retrieve",
      });

      const projectId = createResponse.body.id;

      // Then get it by ID
      const getResponse = await supertest(API_URL).get(
        `/projects/${projectId}`
      );

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(projectId);
    });

    it("should update a project", async () => {
      // First create a project
      const createResponse = await supertest(API_URL).post("/projects").send({
        name: "Project to Update",
      });

      const projectId = createResponse.body.id;

      // Then update it
      const updateResponse = await supertest(API_URL)
        .put(`/projects/${projectId}`)
        .send({
          name: "Updated Project Name",
        });

      expect(updateResponse.status).toBe(200);

      // Check if the project was actually updated by getting it again
      const getResponse = await supertest(API_URL).get(
        `/projects/${projectId}`
      );
      expect(getResponse.body.name).toBe("Updated Project Name");
    });

    it("should delete a project", async () => {
      // First create a project
      const createResponse = await supertest(API_URL).post("/projects").send({
        name: "Project to Delete",
      });

      const projectId = createResponse.body.id;

      // Then delete it
      const deleteResponse = await supertest(API_URL).delete(
        `/projects/${projectId}`
      );

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await supertest(API_URL).get(
        `/projects/${projectId}`
      );
      expect(getResponse.status).toBe(404);
    });
  });

  // Test the analyses endpoint
  describe("Analyses API", () => {
    it("should create and list analyses for a project", async () => {
      // First create a project
      const projectResponse = await supertest(API_URL)
        .post("/projects")
        .send({
          name: "Project with Analyses",
        })
        .set("Content-Type", "application/json");

      const projectId = projectResponse.body.id;

      // Create an analysis for the project
      const analysisResponse = await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .send({
          name: "Test Analysis",
          data: { test: "data" },
        })
        .set("Content-Type", "application/json");

      expect(analysisResponse.status).toBe(201);

      // Then get the project's analyses
      const listResponse = await supertest(API_URL).get(
        `/projects/${projectId}/analyses`
      );
      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);

      // Verify our analysis is in the list
      expect(listResponse.body.length).toBeGreaterThan(0);
    });

    it("should delete an analysis", async () => {
      // First create a project
      const projectResponse = await supertest(API_URL)
        .post("/projects")
        .send({
          name: "Project with Analyses",
        })
        .set("Content-Type", "application/json");

      const projectId = projectResponse.body.id;

      // Create an analysis for the project
      const analysisResponse = await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .send({
          name: "Test Analysis",
          data: { test: "data" },
        })
        .set("Content-Type", "application/json");

      const analysisId = analysisResponse.body.id;

      // Then delete the analysis
      const deleteResponse = await supertest(API_URL).delete(
        `/projects/${projectId}/analyses/${analysisId}`
      );

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await supertest(API_URL).get(
        `/projects/${projectId}/analyses/${analysisId}`
      );
      expect(getResponse.status).toBe(404);
    });

    it("should delete all analyses for a project", async () => {
      // First create a project
      const projectResponse = await supertest(API_URL)
        .post("/projects")
        .send({
          name: "Project with Analyses",
        })
        .set("Content-Type", "application/json");

      const projectId = projectResponse.body.id;

      // Create two analyses for the project
      await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .send({
          name: "Test Analysis 1",
          data: { test: "data" },
        })
        .set("Content-Type", "application/json");

      await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .send({
          name: "Test Analysis 2",
          data: { test: "data" },
        })
        .set("Content-Type", "application/json");

      const getResponseBeforeDelete = await supertest(API_URL).get(
        `/projects/${projectId}/analyses`
      );
      expect(getResponseBeforeDelete.status).toBe(200);
      expect(getResponseBeforeDelete.body.length).toBe(2);

      // Then delete all analyses for the project
      const deleteResponse = await supertest(API_URL).delete(
        `/projects/${projectId}`
      );

      expect(deleteResponse.status).toBe(200);

      // Verify all analyses are deleted
      const getResponse = await supertest(API_URL).get(
        `/projects/${projectId}/analyses`
      );
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.length).toBe(0);
    });
  });
});
