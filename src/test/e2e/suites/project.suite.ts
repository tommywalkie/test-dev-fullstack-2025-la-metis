import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { API_URL } from "../utils";
import { UserRole, User } from "@/user/user.entity";

export function projectTests() {
  describe("Projects API", () => {
    // Generate a unique project name for testing
    const uniqueProjectName = `Test Project ${Date.now()}`;

    let adminUser: User;
    let managerUser: User;
    let readerUser: User;

    beforeAll(async () => {
      // Create a test user
      const createAdminResponse = await supertest(API_URL)
        .post("/users")
        .send({ name: "Test Admin", role: UserRole.ADMIN });

      adminUser = createAdminResponse.body;

      const createManagerResponse = await supertest(API_URL)
        .post("/users")
        .send({ name: "Test Manager", role: UserRole.MANAGER });

      managerUser = createManagerResponse.body;

      const createReaderResponse = await supertest(API_URL)
        .post("/users")
        .send({ name: "Test Reader", role: UserRole.READER });

      readerUser = createReaderResponse.body;
    });

    it("should create a project and find it in the list", async () => {
      // Create a project with a unique name
      const newProject = {
        name: uniqueProjectName,
      };

      // Create the project
      const createResponse = await supertest(API_URL)
        .post("/projects")
        .send(newProject)
        .set("Content-Type", "application/json")
        .set("X-User-ID", adminUser.id.toString());

      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty("id");

      // Get the list of all projects
      const listResponse = await supertest(API_URL)
        .get("/projects")
        .set("X-User-ID", adminUser.id.toString());

      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);

      // Find our project in the list
      const foundProject = listResponse.body.find(
        (project: any) => project.name === uniqueProjectName
      );
      expect(foundProject).toBeDefined();
      expect(foundProject.id).toBe(createResponse.body.id);
    });

    it("should list projects", async () => {
      const response = await supertest(API_URL)
        .get("/projects")
        .set("X-User-ID", adminUser.id.toString());

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
        .set("Content-Type", "application/json")
        .set("X-User-ID", adminUser.id.toString());

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(newProject.name);
    });

    it("should get a project by ID", async () => {
      // First create a project
      const createResponse = await supertest(API_URL)
        .post("/projects")
        .send({
          name: "Project to Retrieve",
        })
        .set("X-User-ID", adminUser.id.toString());

      const projectId = createResponse.body.id;

      // Then get it by ID
      const getResponse = await supertest(API_URL)
        .get(`/projects/${projectId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(projectId);
    });

    it("should update a project", async () => {
      // First create a project
      const createResponse = await supertest(API_URL)
        .post("/projects")
        .send({
          name: "Project to Update",
        })
        .set("X-User-ID", adminUser.id.toString());

      const projectId = createResponse.body.id;

      // Then update it
      const updateResponse = await supertest(API_URL)
        .put(`/projects/${projectId}`)
        .send({
          name: "Updated Project Name",
        })
        .set("X-User-ID", adminUser.id.toString());

      expect(updateResponse.status).toBe(200);

      // Check if the project was actually updated by getting it again
      const getResponse = await supertest(API_URL)
        .get(`/projects/${projectId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(getResponse.body.name).toBe("Updated Project Name");
    });

    it("should delete a project", async () => {
      // First create a project
      const createResponse = await supertest(API_URL)
        .post("/projects")
        .send({
          name: "Project to Delete",
        })
        .set("X-User-ID", adminUser.id.toString());

      const projectId = createResponse.body.id;

      // Then delete it
      const deleteResponse = await supertest(API_URL)
        .delete(`/projects/${projectId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await supertest(API_URL)
        .get(`/projects/${projectId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(getResponse.status).toBe(404);
    });
  });
}
