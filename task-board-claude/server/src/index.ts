// server/src/index.ts
import express from "express";
import { createMcpHandler } from "@modelcontextprotocol/server";
import {
  toNodeHandler,
  localhostHostValidation,
  localhostOriginValidation,
} from "@modelcontextprotocol/node";
import { createServer } from "./server.js";

// A fresh server per request keeps the endpoint stateless. One factory serves
// every supported protocol revision, so older clients keep working.
const handler = createMcpHandler(() => createServer(), {
  onerror: (error) => console.error(error),
});

// DNS rebinding protection: only answer requests whose Host and Origin headers
// point at localhost. Allow your real domain instead when you deploy.
const checkHost = localhostHostValidation();
const checkOrigin = localhostOriginValidation();

const app = express();

// No express.json() here: toNodeHandler reads the request stream itself.
app.post(
  "/mcp",
  (req, res, next) => {
    if (!checkHost(req, res) || !checkOrigin(req, res)) return;
    next();
  },
  toNodeHandler(handler)
);

app.listen(3000, () => {
  console.log("Task board MCP server: http://localhost:3000/mcp");
});
