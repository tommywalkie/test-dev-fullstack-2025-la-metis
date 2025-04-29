import { spawn, ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

let server: ChildProcess | null = null;
let serverStarted = false;
const isCI = process.env.CI === "true";

// Helper to wait for a specific time
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Check if port is in use
const isPortInUse = async (port: number): Promise<boolean> => {
  try {
    if (process.platform === "win32") {
      // Windows command to check port usage
      const { stdout } = await execAsync(
        `netstat -ano | findstr :${port} | findstr LISTENING`
      );
      return stdout.trim().length > 0;
    } else {
      // Unix command to check port usage
      const { stdout } = await execAsync(`lsof -i:${port} -t`);
      return stdout.trim().length > 0;
    }
  } catch (error) {
    // Command failed, which usually means the port is not in use
    return false;
  }
};

// Kill process using a specific port
const killProcessOnPort = async (port: number): Promise<boolean> => {
  try {
    if (process.platform === "win32") {
      // Find PID using the port
      const { stdout: findStdout } = await execAsync(
        `netstat -ano | findstr :${port} | findstr LISTENING`
      );
      const pidMatch = findStdout.match(/\s+(\d+)$/m);
      if (pidMatch && pidMatch[1]) {
        const pid = pidMatch[1].trim();
        // Kill the process
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`Killed process with PID ${pid} using port ${port}`);
        return true;
      }
    } else {
      // Unix command to kill process on port
      const { stdout } = await execAsync(`lsof -i:${port} -t`);
      if (stdout.trim()) {
        await execAsync(`kill -9 ${stdout.trim()}`);
        console.log(`Killed process using port ${port}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Failed to kill process on port ${port}:`, error);
    return false;
  }
};

// Helper to wait for the server to be ready
export const waitForServer = async (
  port: number,
  maxRetries = isCI ? 10 : 3, // More retries in CI environment
  retryInterval = 500
): Promise<boolean> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(`http://localhost:${port}`);
      if (response.ok) {
        console.log(`Server is ready on port ${port}`);
        serverStarted = true;
        return true;
      }
    } catch (error) {
      // Server not ready yet
      if (retries % 2 === 0) {
        console.log(
          `Waiting for server on port ${port}... (${retries}/${maxRetries} retries)`
        );
      }

      // Check if server process is still running
      if (server && !server.connected && server.exitCode !== null) {
        console.error(`Server process exited with code ${server.exitCode}`);
        return false;
      }
    }

    await wait(retryInterval);
    retries++;
  }

  console.error(`Server failed to start after ${maxRetries} retries`);
  return false;
};

// Setup graceful shutdown handlers
const setupShutdownHandlers = () => {
  // Ensure graceful shutdown on process exit
  process.on("exit", () => {
    if (server) {
      try {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", server.pid!.toString(), "/f", "/t"]);
        } else {
          server.kill("SIGKILL");
        }
      } catch (error) {
        // Ignore errors during exit
      }
    }
  });

  // Handle Ctrl+C and other termination signals
  process.on("SIGINT", () => {
    console.log("Received SIGINT. Graceful shutdown...");
    stopServer().then(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Graceful shutdown...");
    stopServer().then(() => process.exit(0));
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    stopServer().then(() => process.exit(1));
  });
};

// Get port from .env.test file
const getTestPort = (): number => {
  return parseInt(process.env.PORT || "3222");
};

export const startServer = async (): Promise<void> => {
  // Setup shutdown handlers
  setupShutdownHandlers();

  console.log("Starting test server...");

  // Get port from .env.test
  const port = getTestPort();
  console.log(`Using test server port: ${port}`);

  // Check if port is already in use and kill the process
  try {
    if (await isPortInUse(port)) {
      console.log(`Port ${port} is already in use. Attempting to free it...`);
      await killProcessOnPort(port);
      await wait(1000); // Wait for the port to be released
    }
  } catch (error) {
    console.error("Error checking port:", error);
  }

  // Reset server state
  serverStarted = false;

  // Start the server with test environment
  server = spawn(
    "dotenvx",
    ["run", "-e", ".env.test", "--", "tsx", "src/index.ts"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NODE_ENV: "test",
        PORT: port.toString(),
      },
      shell: true,
    }
  );

  // Setup server event handlers
  let serverError: Error | null = null;

  setupServerEventHandlers(server, port, (error) => {
    serverError = error;
  });

  // Wait for server to be ready
  const serverReady = await waitForServer(port);

  if (!serverReady || serverError) {
    await stopServer();
    throw (
      serverError || new Error(`Failed to start test server on port ${port}`)
    );
  }

  // Additional wait to ensure database is initialized
  await wait(1000);
  console.log("Test server is fully initialized and ready");
};

const setupServerEventHandlers = (
  serverProcess: ChildProcess,
  port: number,
  onError: (error: Error) => void
) => {
  let errorDetected = false;

  if (serverProcess.stdout) {
    serverProcess.stdout.on("data", (data) => {
      const output = data.toString().trim();

      // Stream all server output
      if (output) {
        // Filter out some noisy messages if needed
        if (
          !output.includes("dotenvx") &&
          !output.includes("Executing query")
        ) {
          console.log(`[Server]: ${output}`);
        }
      }

      // Check if server started on wrong port
      if (
        output.includes("Server is running on http://localhost:") &&
        !output.includes(`http://localhost:${port}`)
      ) {
        const errorMsg = `WARNING: Server started on wrong port! Expected ${port}`;
        console.error(errorMsg);
        onError(new Error(errorMsg));
      }
    });
  }

  if (serverProcess.stderr) {
    serverProcess.stderr.on("data", (data) => {
      const errorOutput = data.toString().trim();
      console.error(`[Server Error]: ${errorOutput}`);

      // Detect EADDRINUSE error
      if (errorOutput.includes("EADDRINUSE") && !errorDetected) {
        errorDetected = true;
        onError(
          new Error(
            `Port ${port} is already in use. Please close the application using this port.`
          )
        );
      }
    });
  }

  serverProcess.on("error", (error) => {
    console.error("Failed to start server:", error);
    onError(error);
  });

  serverProcess.on("exit", (code, signal) => {
    if (code !== 0 && !serverStarted && !errorDetected) {
      errorDetected = true;
      onError(
        new Error(
          `Server process exited with an error code ${code} and signal ${signal}`
        )
      );
    }
    console.log(`Server process exited with code ${code}`);
    server = null;
  });
};

export const stopServer = async (): Promise<void> => {
  console.log("Shutting down test server...");

  if (!server) {
    console.log("No server to shut down");
    return;
  }

  const port = getTestPort();
  let killed = false;

  try {
    // First try graceful shutdown
    if (process.platform === "win32") {
      // Windows requires a different approach to kill the process tree
      const killProcess = spawn("taskkill", [
        "/pid",
        server.pid!.toString(),
        "/f",
        "/t",
      ]);

      // Wait for the kill process to complete
      await new Promise<void>((resolve) => {
        killProcess.on("close", () => {
          killed = true;
          resolve();
        });

        killProcess.on("error", (error) => {
          console.error("Error killing server process:", error);
          resolve();
        });

        // Timeout for the kill process
        setTimeout(resolve, 3000);
      });
    } else {
      // Unix-like systems
      if (server) {
        server.kill("SIGTERM");

        // Wait a bit for the process to terminate
        await wait(1000);

        // Check if process is still running and server reference exists
        if (server && !server.killed) {
          server.kill("SIGKILL");
          await wait(1000);
        }

        killed = true;
      }
    }

    // Clear any references to the server
    server = null;

    // Double-check if the port is still in use and force kill if needed
    await wait(1000); // Wait for OS to release the port
    const portStillInUse = await isPortInUse(port);

    if (portStillInUse) {
      console.log(
        `Port ${port} is still in use after server shutdown. Forcing cleanup...`
      );
      await killProcessOnPort(port);
      await wait(1000); // Wait again after forced kill
    }

    console.log("Test server has been shut down successfully");
  } catch (error) {
    console.error("Error shutting down server:", error);
  } finally {
    // Ensure server reference is cleared
    server = null;

    // Final check and cleanup
    if (!killed) {
      console.log("Attempting final cleanup of port...");
      await killProcessOnPort(getTestPort());
    }
  }
};
