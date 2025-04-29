import { describe, expect, it } from "vitest";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

describe("GET /", () => {
  it("should return a 200 status code", async () => {
    const response = await app.request("/");
    expect(response.status).toBe(200);
  });
});
