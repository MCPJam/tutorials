// Entry point: exposes the task board MCP server over Streamable HTTP at
// http://localhost:3000/mcp (stateless, one server per request).
import express from "express";
import { createMcpHandler } from "@modelcontextprotocol/server";
import {
  toNodeHandler,
  localhostHostValidation,
  localhostOriginValidation,
} from "@modelcontextprotocol/node";
import { createServer } from "./server.js";

// createMcpHandler builds a fresh server per request, so the endpoint stays
// stateless. One factory serves every supported protocol revision, so older
// clients keep working without extra wiring.
const handler = createMcpHandler(() => createServer(), {
  onerror: (error) => console.error(error),
});

// DNS rebinding protection: a local endpoint should only answer requests whose
// Host and Origin headers point at localhost. Drop these when you deploy
// behind a real domain, and allow that domain instead.
const checkHost = localhostHostValidation();
const checkOrigin = localhostOriginValidation();

const app = express();

// No express.json() here: toNodeHandler reads the request stream itself, so a
// body parser in front of it would consume the body first.
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
