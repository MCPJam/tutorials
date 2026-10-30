# Task Board

A small GitHub Copilot MCP App built on the Model Context Protocol (MCP) Apps standard. The server exposes task tools. A React app renders the tasks inline in Copilot Chat and lets you mark them done.

This is the [Claude task board](../task-board-claude) with one change: the server instructions and tool descriptions say the tools are for the user's task board, so Copilot doesn't route task requests to its built-in `#todos` tool. The UI and the rest of the server are identical.

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

   The MCP endpoint is at `http://127.0.0.1:3000/mcp`.

3. Test it with [MCPJam](https://github.com/MCPJam/inspector), which emulates the Copilot client locally, so you don't need a tunnel or a GitHub account:

   ```bash
   npx @mcpjam/inspector@latest
   ```

   Add an HTTP server at `http://127.0.0.1:3000/mcp`, select **Copilot** as the client in the Playground, then invoke `show_task_board` to render the app.

4. To run it in GitHub Copilot itself, open VS Code with the GitHub Copilot Chat extension, run **MCP: Add Server** from the Command Palette, choose **HTTP**, and enter `http://127.0.0.1:3000/mcp`. Then ask Copilot in agent mode to "Show me my open tasks." On Copilot Business and Enterprise, an admin has to turn on the MCP servers in Copilot policy first.

Run `npm run build` in `web/` again after each UI change. The server reads the bundle on every request, so you don't need to restart it.
