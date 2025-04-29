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

    it("should only list projects that a user has created or has access to", async () => {
      // Create a project by admin
      const adminProject = await supertest(API_URL)
        .post("/projects")
        .send({ name: "Admin's Project" })
        .set("X-User-ID", adminUser.id.toString());

      // Create a project by manager
      const managerProject = await supertest(API_URL)
        .post("/projects")
        .send({ name: "Manager's Project" })
        .set("X-User-ID", managerUser.id.toString());

      // Add reader to admin's project
      await supertest(API_URL)
        .put(`/projects/${adminProject.body.id}`)
        .send({
          name: "Admin's Project",
          userIds: [readerUser.id],
        })
        .set("X-User-ID", adminUser.id.toString());

      // Test 1: Admin should see both projects (admin's role allows seeing all)
      const adminListResponse = await supertest(API_URL)
        .get("/projects")
        .set("X-User-ID", adminUser.id.toString());

      expect(adminListResponse.status).toBe(200);
      expect(
        adminListResponse.body.some((p: any) => p.id === adminProject.body.id)
      ).toBe(true);
      expect(
        adminListResponse.body.some((p: any) => p.id === managerProject.body.id)
      ).toBe(true);

      // Test 2: Manager should see only their own project
      const managerListResponse = await supertest(API_URL)
        .get("/projects")
        .set("X-User-ID", managerUser.id.toString());

      expect(managerListResponse.status).toBe(200);
      expect(
        managerListResponse.body.some(
          (p: any) => p.id === managerProject.body.id
        )
      ).toBe(true);
      expect(
        managerListResponse.body.some((p: any) => p.id === adminProject.body.id)
      ).toBe(false);

      // Test 3: Reader should only see the admin's project they were added to
      const readerListResponse = await supertest(API_URL)
        .get("/projects")
        .set("X-User-ID", readerUser.id.toString());

      expect(readerListResponse.status).toBe(200);
      expect(
        readerListResponse.body.some((p: any) => p.id === adminProject.body.id)
      ).toBe(true);
      expect(
        readerListResponse.body.some(
          (p: any) => p.id === managerProject.body.id
        )
      ).toBe(false);
    });

    it("should only allow access to project details for users with permission", async () => {
      // Create a project by admin
      const adminProject = await supertest(API_URL)
        .post("/projects")
        .send({ name: "Admin's Private Project" })
        .set("X-User-ID", adminUser.id.toString());

      // Test 1: Admin can access their project
      const adminAccessResponse = await supertest(API_URL)
        .get(`/projects/${adminProject.body.id}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(adminAccessResponse.status).toBe(200);

      // Test 2: Manager cannot access admin's project
      const managerAccessResponse = await supertest(API_URL)
        .get(`/projects/${adminProject.body.id}`)
        .set("X-User-ID", managerUser.id.toString());

      expect(managerAccessResponse.status).toBe(404); // Should return 404 for security reasons

      // Test 3: Add manager to the project
      await supertest(API_URL)
        .put(`/projects/${adminProject.body.id}`)
        .send({
          name: "Admin's Private Project",
          userIds: [managerUser.id],
        })
        .set("X-User-ID", adminUser.id.toString());

      // Test 4: Now manager should be able to access the project
      const managerAccessAfterResponse = await supertest(API_URL)
        .get(`/projects/${adminProject.body.id}`)
        .set("X-User-ID", managerUser.id.toString());

      expect(managerAccessAfterResponse.status).toBe(200);

      // Test 5: Reader still cannot access the project
      const readerAccessResponse = await supertest(API_URL)
        .get(`/projects/${adminProject.body.id}`)
        .set("X-User-ID", readerUser.id.toString());

      expect(readerAccessResponse.status).toBe(404);
    });

    it("should allow a user to access projects they have permission for", async () => {
      // Create a project by admin
      const adminProject = await supertest(API_URL)
        .post("/projects")
        .send({ name: "Project with Reader Access" })
        .set("X-User-ID", adminUser.id.toString());

      // Add reader to the project
      await supertest(API_URL)
        .put(`/projects/${adminProject.body.id}`)
        .send({
          name: "Project with Reader Access",
          userIds: [readerUser.id],
        })
        .set("X-User-ID", adminUser.id.toString());

      // Reader should be able to access the project they were added to
      const readerAccessResponse = await supertest(API_URL)
        .get(`/projects/${adminProject.body.id}`)
        .set("X-User-ID", readerUser.id.toString());

      expect(readerAccessResponse.status).toBe(200);

      // Reader should see the project in their list
      const readerListResponse = await supertest(API_URL)
        .get("/projects")
        .set("X-User-ID", readerUser.id.toString());

      expect(readerListResponse.status).toBe(200);
      expect(
        readerListResponse.body.some((p: any) => p.id === adminProject.body.id)
      ).toBe(true);
    });

    it("should not allow readers to create projects", async () => {
      // Attempt to create a project as a reader (should fail)
      const readerProject = await supertest(API_URL)
        .post("/projects")
        .send({ name: "Reader's Attempted Project" })
        .set("X-User-ID", readerUser.id.toString());

      // Should return 403 Forbidden
      expect(readerProject.status).toBe(403);
    });
  });
}
