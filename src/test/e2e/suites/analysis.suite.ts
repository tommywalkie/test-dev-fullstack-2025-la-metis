import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { API_URL } from "../utils";
import { UserRole } from "@/user/user.entity";
import { User } from "@/user/user.entity";

export function analysisTests() {
  describe("Analyses API", () => {
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

    it("should create and list analyses for a project", async () => {
      // First create a project
      const projectResponse = await supertest(API_URL)
        .post("/projects")
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Project with Analyses",
        })
        .set("Content-Type", "application/json");

      const projectId = projectResponse.body.id;

      // Create an analysis for the project
      const analysisResponse = await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Test Analysis",
        })
        .set("Content-Type", "application/json");

      expect(analysisResponse.status).toBe(201);

      // Then get the project's analyses
      const listResponse = await supertest(API_URL)
        .get(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString());
      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);

      // Verify our analysis is in the list
      expect(listResponse.body.length).toBeGreaterThan(0);
    });

    it("should delete an analysis", async () => {
      // First create a project
      const projectResponse = await supertest(API_URL)
        .post("/projects")
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Project with Analyses",
        })
        .set("Content-Type", "application/json");

      const projectId = projectResponse.body.id;

      // Create an analysis for the project
      const analysisResponse = await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Test Analysis",
        })
        .set("Content-Type", "application/json");

      const analysisId = analysisResponse.body.id;

      // Then delete the analysis
      const deleteResponse = await supertest(API_URL)
        .delete(`/projects/${projectId}/analyses/${analysisId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await supertest(API_URL)
        .get(`/projects/${projectId}/analyses/${analysisId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(getResponse.status).toBe(404);
    });

    it("should delete all analyses for a project", async () => {
      // First create a project
      const projectResponse = await supertest(API_URL)
        .post("/projects")
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Project with Analyses",
        })
        .set("Content-Type", "application/json");

      const projectId = projectResponse.body.id;

      // Create two analyses for the project
      await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Test Analysis 1",
        })
        .set("Content-Type", "application/json");

      await supertest(API_URL)
        .post(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Test Analysis 2",
        })
        .set("Content-Type", "application/json");

      const getResponseBeforeDelete = await supertest(API_URL)
        .get(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString());

      expect(getResponseBeforeDelete.status).toBe(200);
      expect(getResponseBeforeDelete.body.length).toBe(2);

      // Then delete all analyses for the project
      const deleteResponse = await supertest(API_URL)
        .delete(`/projects/${projectId}`)
        .set("X-User-ID", adminUser.id.toString());

      expect(deleteResponse.status).toBe(200);

      // Verify all analyses are deleted
      const getResponse = await supertest(API_URL)
        .get(`/projects/${projectId}/analyses`)
        .set("X-User-ID", adminUser.id.toString());
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.length).toBe(0);
    });

    it("should enforce role-based permissions: managers can only manage their own analyses and readers can only read", async () => {
      // Create a project by admin
      const adminProject = await supertest(API_URL)
        .post("/projects")
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Admin's Analysis Project",
        });

      // Create a project by manager
      const managerProject = await supertest(API_URL)
        .post("/projects")
        .set("X-User-ID", managerUser.id.toString())
        .send({
          name: "Manager's Analysis Project",
        });

      // Create an analysis in admin's project
      const adminAnalysis = await supertest(API_URL)
        .post(`/projects/${adminProject.body.id}/analyses`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Admin's Analysis",
        });

      // Create an analysis in manager's project
      const managerAnalysis = await supertest(API_URL)
        .post(`/projects/${managerProject.body.id}/analyses`)
        .set("X-User-ID", managerUser.id.toString())
        .send({
          name: "Manager's Analysis",
        });

      // Test 1: Manager can't create analysis in admin's project
      const managerCreateInAdminProject = await supertest(API_URL)
        .post(`/projects/${adminProject.body.id}/analyses`)
        .set("X-User-ID", managerUser.id.toString())
        .send({
          name: "Unauthorized Analysis",
        });

      expect(managerCreateInAdminProject.status).toBe(403);

      // Test 2: Reader can't create analysis in any project
      const readerCreateAnalysis = await supertest(API_URL)
        .post(`/projects/${adminProject.body.id}/analyses`)
        .set("X-User-ID", readerUser.id.toString())
        .send({
          name: "Reader's Analysis Attempt",
        });

      expect(readerCreateAnalysis.status).toBe(403);

      // Test 3: Manager can't update analysis in admin's project
      const managerUpdateAdminAnalysis = await supertest(API_URL)
        .put(
          `/projects/${adminProject.body.id}/analyses/${adminAnalysis.body.id}`
        )
        .set("X-User-ID", managerUser.id.toString())
        .send({
          name: "Updated by Manager",
        });

      expect(managerUpdateAdminAnalysis.status).toBe(403);

      // Test 4: Manager can update their own analysis
      const managerUpdateOwnAnalysis = await supertest(API_URL)
        .put(
          `/projects/${managerProject.body.id}/analyses/${managerAnalysis.body.id}`
        )
        .set("X-User-ID", managerUser.id.toString())
        .send({
          name: "Updated by Manager",
        });

      expect(managerUpdateOwnAnalysis.status).toBe(200);

      // Test 5: Admin can update any analysis
      const adminUpdateManagerAnalysis = await supertest(API_URL)
        .put(
          `/projects/${managerProject.body.id}/analyses/${managerAnalysis.body.id}`
        )
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Updated by Admin",
        });

      expect(adminUpdateManagerAnalysis.status).toBe(200);

      // Test 6: Manager can't delete analysis in admin's project
      const managerDeleteAdminAnalysis = await supertest(API_URL)
        .delete(
          `/projects/${adminProject.body.id}/analyses/${adminAnalysis.body.id}`
        )
        .set("X-User-ID", managerUser.id.toString());

      expect(managerDeleteAdminAnalysis.status).toBe(403);

      // Test 7: Manager can delete their own analysis
      const managerDeleteOwnAnalysis = await supertest(API_URL)
        .delete(
          `/projects/${managerProject.body.id}/analyses/${managerAnalysis.body.id}`
        )
        .set("X-User-ID", managerUser.id.toString());

      expect(managerDeleteOwnAnalysis.status).toBe(200);

      // Test 8: Reader with access to a project can read analyses
      // First, add reader to admin's project
      await supertest(API_URL)
        .put(`/projects/${adminProject.body.id}`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Admin's Analysis Project",
          userIds: [readerUser.id],
        });

      // Create a new analysis in admin's project
      const newAdminAnalysis = await supertest(API_URL)
        .post(`/projects/${adminProject.body.id}/analyses`)
        .set("X-User-ID", adminUser.id.toString())
        .send({
          name: "Analysis for Reader",
        });

      // Reader should be able to read the analysis
      const readerGetAnalysis = await supertest(API_URL)
        .get(
          `/projects/${adminProject.body.id}/analyses/${newAdminAnalysis.body.id}`
        )
        .set("X-User-ID", readerUser.id.toString());

      expect(readerGetAnalysis.status).toBe(200);
      expect(readerGetAnalysis.body.name).toBe("Analysis for Reader");

      // Test 9: Reader can't read analyses from projects they don't have access to
      const readerGetUnauthorizedAnalysis = await supertest(API_URL)
        .get(`/projects/${managerProject.body.id}/analyses`)
        .set("X-User-ID", readerUser.id.toString());

      // Should return empty array since they don't have access
      expect(readerGetUnauthorizedAnalysis.status).toBe(200);
      expect(readerGetUnauthorizedAnalysis.body).toHaveLength(0);
    });
  });
}
