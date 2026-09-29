# Task Board

A small Claude MCP App built on the Model Context Protocol (MCP) Apps standard. The server exposes task tools. A React app renders the tasks inline in the conversation and lets you mark them done.

## Structure

```
.
├── server/          MCP server (Express + @modelcontextprotocol/server)
│   └── src/
│       ├── index.ts     HTTP entry point, serves /mcp on port 3000
│       └── server.ts    Tools and the UI resource
└── web/             App UI (React, bundled with esbuild)
    └── src/
        └── component.tsx
```

## Tools

| Tool              | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `list_tasks`      | Returns tasks, optionally filtered by `status` (`open`/`done`). |
| `complete_task`   | Marks a task as done by `taskId`.                              |
| `show_task_board` | Renders the task board UI (`ui://task-board/v1.html`).         |

Tasks live in memory, so any change is lost when the server restarts.

## Getting started

Requires Node.js 22+.

1. Build the UI. The server reads `web/dist/component.js`, so do this first:

   ```bash
   cd web
   npm install
   npm run build
   ```

2. Start the server:

   ```bash
   cd server
   npm install
   npm start
   ```

   The MCP endpoint is at `http://localhost:3000/mcp`.

3. Test it with [MCPJam](https://github.com/MCPJam/inspector), which emulates the Claude client locally, so you don't need a tunnel or a Claude account:

   ```bash
   npx @mcpjam/inspector@latest
   ```

   Add an HTTP server at `http://localhost:3000/mcp`, then invoke `show_task_board` from the Playground to render the app.

   To run it inside Claude itself, either point Claude Desktop at the local server through `mcp-remote` (no public URL needed), or expose it with a tunnel and add it as a custom connector in claude.ai.

Run `npm run build` in `web/` again after each UI change. The server reads the bundle on every request, so you don't need to restart it.
