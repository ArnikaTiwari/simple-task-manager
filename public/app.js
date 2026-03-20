const state = {
  tasks: [],
  filter: "all",
};

const taskForm = document.getElementById("taskForm");
const formMessage = document.getElementById("formMessage");
const submitButton = document.getElementById("submitButton");
const listState = document.getElementById("listState");
const taskList = document.getElementById("taskList");
const healthText = document.getElementById("healthText");
const filters = document.getElementById("filters");
const template = document.getElementById("taskTemplate");
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const editMessage = document.getElementById("editMessage");
const cancelEditButton = document.getElementById("cancelEdit");

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function updateCounts() {
  const counts = state.tasks.reduce(
    (acc, task) => {
      acc.all += 1;
      acc[task.status] += 1;
      return acc;
    },
    { all: 0, pending: 0, completed: 0 }
  );

  document.getElementById("countAll").textContent = counts.all;
  document.getElementById("countPending").textContent = counts.pending;
  document.getElementById("countCompleted").textContent = counts.completed;
}

function getFilteredTasks() {
  if (state.filter === "all") {
    return state.tasks;
  }

  return state.tasks.filter((task) => task.status === state.filter);
}

function renderTasks() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";
  updateCounts();

  if (state.tasks.length === 0) {
    listState.hidden = false;
    listState.textContent = "No tasks yet. Add your first one from the form.";
    return;
  }

  if (filtered.length === 0) {
    listState.hidden = false;
    listState.textContent = `No ${state.filter} tasks right now.`;
    return;
  }

  listState.hidden = true;

  filtered.forEach((task) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".task-card");
    const toggleButton = fragment.querySelector(".toggle-btn");
    const title = fragment.querySelector(".task-title");
    const badge = fragment.querySelector(".status-badge");
    const description = fragment.querySelector(".task-desc");
    const meta = fragment.querySelector(".task-meta");
    const editButton = fragment.querySelector(".edit-btn");
    const deleteButton = fragment.querySelector(".delete-btn");

    title.textContent = task.title;
    badge.textContent = task.status;
    badge.classList.add(task.status);
    description.textContent = task.description || "No description provided.";
    meta.textContent = `Created ${formatDate(task.createdAt)} | Updated ${formatDate(task.updatedAt)}`;

    toggleButton.classList.toggle("done", task.status === "completed");
    toggleButton.textContent = task.status === "completed" ? "✓" : "";
    toggleButton.addEventListener("click", () => toggleTask(task.id));

    editButton.addEventListener("click", () => openEditDialog(task));
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    card.dataset.id = task.id;
    taskList.appendChild(fragment);
  });
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

async function loadHealth() {
  try {
    const payload = await request("/api/health");
    healthText.textContent = payload.message;
  } catch (_error) {
    healthText.textContent = "API unavailable";
  }
}

async function loadTasks() {
  listState.hidden = false;
  listState.textContent = "Loading tasks...";

  try {
    const payload = await request("/api/tasks");
    state.tasks = payload.data;
    renderTasks();
  } catch (error) {
    listState.hidden = false;
    listState.textContent = error.message;
  }
}

async function createTask(event) {
  event.preventDefault();
  submitButton.disabled = true;
  setMessage(formMessage, "");

  const formData = new FormData(taskForm);
  const body = {
    title: formData.get("title"),
    description: formData.get("description"),
  };

  try {
    const payload = await request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    });
    state.tasks.unshift(payload.data);
    taskForm.reset();
    renderTasks();
    setMessage(formMessage, "Task added successfully.");
  } catch (error) {
    setMessage(formMessage, error.message, true);
  } finally {
    submitButton.disabled = false;
  }
}

async function toggleTask(id) {
  try {
    const payload = await request(`/api/tasks/${id}/toggle`, {
      method: "PATCH",
    });
    state.tasks = state.tasks.map((task) => (task.id === id ? payload.data : task));
    renderTasks();
  } catch (error) {
    listState.hidden = false;
    listState.textContent = error.message;
  }
}

async function deleteTask(id) {
  try {
    await request(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    state.tasks = state.tasks.filter((task) => task.id !== id);
    renderTasks();
  } catch (error) {
    listState.hidden = false;
    listState.textContent = error.message;
  }
}

function openEditDialog(task) {
  document.getElementById("editId").value = task.id;
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description;
  document.getElementById("editStatus").value = task.status;
  setMessage(editMessage, "");
  editDialog.showModal();
}

async function saveTask(event) {
  event.preventDefault();

  const id = document.getElementById("editId").value;
  const body = {
    title: document.getElementById("editTitle").value,
    description: document.getElementById("editDescription").value,
    status: document.getElementById("editStatus").value,
  };

  try {
    const payload = await request(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    state.tasks = state.tasks.map((task) => (task.id === id ? payload.data : task));
    renderTasks();
    editDialog.close();
  } catch (error) {
    setMessage(editMessage, error.message, true);
  }
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) {
    return;
  }

  state.filter = button.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach((node) => {
    node.classList.toggle("active", node === button);
  });
  renderTasks();
});

taskForm.addEventListener("submit", createTask);
editForm.addEventListener("submit", saveTask);
cancelEditButton.addEventListener("click", () => editDialog.close());

loadHealth();
loadTasks();
