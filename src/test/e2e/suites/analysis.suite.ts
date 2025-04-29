import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { API_URL } from "../utils";

export function analysisTests() {
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
}
