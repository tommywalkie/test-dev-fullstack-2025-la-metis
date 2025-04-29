import { describe, it, expect } from "vitest";
import supertest from "supertest";
import { API_URL } from "../utils";

export function apiTests() {
  describe("API Tests", () => {
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
  });
}
