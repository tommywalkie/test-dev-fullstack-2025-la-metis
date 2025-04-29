import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import { User, UserRole } from "@/user/user.entity";
import { API_URL } from "../utils";

export function authTests() {
  describe("Authentication Tests", () => {
    let testUser: User;

    // Create a test user before running the tests
    beforeAll(async () => {
      // Create a test user
      const createResponse = await supertest(API_URL)
        .post("/users")
        .send({
          name: "Test User",
          role: UserRole.ADMIN,
        })
        .set("Content-Type", "application/json");

      expect(createResponse.status).toBe(201);
      testUser = createResponse.body;
    });

    it("should return 401 when accessing users without authentication", async () => {
      const response = await supertest(API_URL).get("/users");
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("User ID not provided");
    });

    it("should return 200 when accessing users with valid authentication", async () => {
      const response = await supertest(API_URL)
        .get("/users")
        .set("X-User-ID", testUser.id.toString());

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Verify our test user is in the list
      const foundUser = response.body.find(
        (user: User) => user.id === testUser.id
      );
      expect(foundUser).toBeDefined();
      expect(foundUser.name).toBe(testUser.name);
    });
  });
}
