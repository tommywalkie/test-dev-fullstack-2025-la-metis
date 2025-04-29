import { describe, it, expect, vi, beforeEach } from "vitest";
import { authMiddleware } from "./auth.middleware";
import { Context } from "hono";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../user/user.entity";

// Mock dependencies
vi.mock("../data-source", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

describe("Auth Middleware", () => {
  let mockContext: Partial<Context>;
  let mockNext: () => Promise<void>;
  let mockUserRepository: any;
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
      projectUsers: [],
    };

    // Create a mock repository
    mockUserRepository = {
      findOneBy: vi.fn().mockResolvedValue(mockUser),
    };

    // Mock AppDataSource.getRepository to return our mock repository
    vi.mocked(AppDataSource.getRepository).mockReturnValue(mockUserRepository);

    // Create a mock context
    mockContext = {
      // @ts-ignore
      req: {
        method: "GET",
        header: vi.fn(),
      },
      set: vi.fn(),
      json: vi.fn().mockReturnValue(undefined),
    };

    // Create a mock next function
    mockNext = vi.fn().mockResolvedValue(undefined);
  });

  it("should allow request to pass through if method is excluded", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "POST";
    const middleware = authMiddleware({ exclude: ["POST"] });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.req!.header).not.toHaveBeenCalled();
  });

  it("should return 401 if X-User-ID header is missing", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "GET";
    mockContext.req!.header = vi.fn().mockReturnValue(undefined);
    const middleware = authMiddleware();

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "User ID not provided" },
      401
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 401 if user is not found", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "GET";
    mockContext.req!.header = vi.fn().mockReturnValue("999");
    mockUserRepository.findOneBy.mockResolvedValue(null);
    const middleware = authMiddleware();

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    expect(mockContext.json).toHaveBeenCalledWith(
      { message: "User not found" },
      401
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should set user in context and call next if user is found", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "GET";
    mockContext.req!.header = vi.fn().mockReturnValue("1");
    const middleware = authMiddleware();

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(mockContext.set).toHaveBeenCalledWith("user", mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should only protect specified methods", async () => {
    // Setup
    // @ts-ignore
    mockContext.req!.method = "GET";
    const middleware = authMiddleware({ methods: ["POST"] });

    // Execute
    await middleware(mockContext as Context, mockNext);

    // Verify
    expect(mockNext).toHaveBeenCalled();
    expect(mockContext.req!.header).not.toHaveBeenCalled();
  });
});
