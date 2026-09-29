// web/src/component.tsx
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useApp } from "@modelcontextprotocol/ext-apps/react";

type Task = { id: string; title: string; done: boolean };
type TaskList = { tasks: Task[] };

function TaskBoard() {
  const [tasks, setTasks] = useState<Task[] | null>(null); // null = still loading
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { app, error: connectError } = useApp({
    appInfo: { name: "Task Board", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      // Handlers only fire after the app connects, so set them up here.
      app.ontoolresult = (result) => {
        const list = result.structuredContent as TaskList | undefined;
        if (list?.tasks) setTasks(list.tasks);
      };
    },
  });

  async function complete(id: string) {
    if (!app) return;
    try {
      const result = await app.callServerTool({
        name: "complete_task",
        arguments: { taskId: id },
      });
      if (result.isError) throw new Error("Tool returned an error");
      setTasks((result.structuredContent as TaskList).tasks);
      setError(null);
    } catch {
      setError("Couldn't update that task. Please try again.");
    }
  }

  if (connectError) return <p>Couldn't connect to Claude: {connectError.message}</p>;

  // Skeleton rows that match the final layout, instead of a spinner.
  if (!tasks) {
    return (
      <div style={{ padding: 16 }} aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 44, margin: "8px 0", borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 16, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", fontSize: "var(--font-text-md-size)" }}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {tasks.map((t) => (
          <li
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 44,
              padding: "0 12px",
              marginBottom: 8,
              borderRadius: "var(--border-radius-md)",
              border: `var(--border-width-regular) solid ${t.id === selectedId ? "var(--color-border-primary)" : "var(--color-border-tertiary)"}`,
              background: "var(--color-background-secondary)",
            }}
          >
            <span style={{ textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--color-text-tertiary)" : "inherit" }}>
              {t.title}
            </span>
            {!t.done && (
              <button
                onClick={(e) => { e.stopPropagation(); complete(t.id); }}
                style={{ minHeight: 44, minWidth: 44, border: "none", cursor: "pointer", borderRadius: "var(--border-radius-md)", background: "var(--color-background-inverse)", color: "var(--color-text-inverse)", fontWeight: "var(--font-weight-semibold)" }}
              >
                Done
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && <p role="alert" style={{ color: "var(--color-text-danger)" }}>{error}</p>}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TaskBoard />);
