require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "tasks.json");
const PUBLIC_DIR = path.join(__dirname, "public");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]\n", "utf8");
  }
}

function readTasks() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
}

function normalizeTask(input) {
  return {
    id: input.id,
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    status: input.status === "completed" ? "completed" : "pending",
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

function validateTaskPayload(payload, { partial = false } = {}) {
  const errors = [];

  if (!partial || Object.prototype.hasOwnProperty.call(payload, "title")) {
    const title = String(payload.title || "").trim();
    if (!title) {
      errors.push("Title is required.");
    }
    if (title.length > 100) {
      errors.push("Title must be 100 characters or fewer.");
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "description")) {
    const description = String(payload.description || "").trim();
    if (description.length > 500) {
      errors.push("Description must be 500 characters or fewer.");
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    if (!["pending", "completed"].includes(payload.status)) {
      errors.push("Status must be either pending or completed.");
    }
  }

  return errors;
}

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Task Manager API is running.",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/tasks", (_req, res) => {
  const tasks = readTasks().sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

app.post("/api/tasks", (req, res) => {
  const errors = validateTaskPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  const now = new Date().toISOString();
  const task = normalizeTask({
    id: randomUUID(),
    title: req.body.title,
    description: req.body.description,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  const tasks = readTasks();
  tasks.unshift(task);
  writeTasks(tasks);

  return res.status(201).json({ success: true, data: task });
});

app.put("/api/tasks/:id", (req, res) => {
  const errors = validateTaskPayload(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(" ") });
  }

  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }

  const current = tasks[index];
  const updated = normalizeTask({
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString(),
  });

  tasks[index] = updated;
  writeTasks(tasks);

  return res.json({ success: true, data: updated });
});

app.patch("/api/tasks/:id/toggle", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((task) => task.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }

  const current = tasks[index];
  const updated = {
    ...current,
    status: current.status === "completed" ? "pending" : "completed",
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updated;
  writeTasks(tasks);

  return res.json({ success: true, data: updated });
});

app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const nextTasks = tasks.filter((task) => task.id !== req.params.id);

  if (nextTasks.length === tasks.length) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }

  writeTasks(nextTasks);

  return res.json({ success: true, message: "Task deleted successfully." });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

ensureDataFile();

app.listen(PORT, () => {
  console.log(`Task Manager running at http://localhost:${PORT}`);
});
