import { createServer } from "node:http";
import { serve } from "@hono/node-server";
import { app } from "./app";

const HOST: string = process.env.HOST || "localhost";
const PORT: number = Number(process.env.PORT) || 3000;

serve(
  {
    fetch: app.fetch,
    createServer,
    hostname: HOST,
    port: PORT,
  },
  () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
  }
);
