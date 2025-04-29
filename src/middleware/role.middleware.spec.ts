import { describe, it, expect, vi, beforeEach } from "vitest";
import { roleMiddleware } from "./role.middleware";
import { Context } from "hono";
import { User, UserRole } from "../user/user.entity";

describe("Role Middleware", () => {
  let mockContext: Partial<Context>;
  let mockNext: () => Promise<void>;
  let mockUser: User;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a mock user
    mockUser = {
      id: 1,
      name: "Test User",
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create a mock context
    mockContext = {
      // @ts-ignore
      req: {
        method: "GET",
      },
      get: vi.fn(),
      json: vi.fn().mockReturnValue(undefined),
    };

    // Create a mock next function
    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  it("should return 401 if user is not in context", async () => {
    // Setup
    mockContext.get = vi.fn().mockReturnValue(undefined);
    const middleware = roleMiddleware({ roles: [UserRole.ADMIN] });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "Authentication required before role check" },
      401
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 403 if user does not have required role", async () => {
    // Setup
    mockUser.role = UserRole.READER;
    mockContext.get = vi.fn().mockReturnValue(mockUser);
    const middleware = roleMiddleware({ roles: [UserRole.ADMIN] });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockContext.json).toHaveBeenCalledWith(
      {
        message: "Insufficient permissions",
        required: [UserRole.ADMIN],
        current: UserRole.READER,
      },
      403
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next if user has required role", async () => {
    // Setup
    mockUser.role = UserRole.ADMIN;
    mockContext.get = vi.fn().mockReturnValue(mockUser);
    const middleware = roleMiddleware({ roles: [UserRole.ADMIN] });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockNext).toHaveBeenCalled();
  });

  it("should allow access if user has one of multiple allowed roles", async () => {
    // Setup
    mockUser.role = UserRole.MANAGER;
    mockContext.get = vi.fn().mockReturnValue(mockUser);
    const middleware = roleMiddleware({
      roles: [UserRole.ADMIN, UserRole.MANAGER],
    });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockNext).toHaveBeenCalled();
  });

  it("should skip role check if method is excluded", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "POST";
    const middleware = roleMiddleware({
      roles: [UserRole.ADMIN],
      exclude: ["POST"],
    });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.get).not.toHaveBeenCalled();
  });

  it("should skip role check if method is not in protected methods", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "GET";
    const middleware = roleMiddleware({
      roles: [UserRole.ADMIN],
      methods: ["POST", "PUT", "DELETE"],
    });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.get).not.toHaveBeenCalled();
  });

  it("should check role if method is in protected methods", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "POST";
    mockUser.role = UserRole.ADMIN;
    mockContext.get = vi.fn().mockReturnValue(mockUser);
    const middleware = roleMiddleware({
      roles: [UserRole.ADMIN],
      methods: ["POST", "PUT", "DELETE"],
    });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockContext.get).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
