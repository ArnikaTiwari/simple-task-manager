import React, { useEffect, useState } from 'react';
import { getTasks, createTask, toggleTask, deleteTask, updateTask } from './api';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | completed

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data.data);
    } catch (err) {
      setError('Failed to load tasks. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async (data) => {
    const res = await createTask(data);
    setTasks((prev) => [res.data.data, ...prev]);
  };

  const handleToggle = async (id) => {
    const res = await toggleTask(id);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.data : t)));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const handleUpdate = async (id, data) => {
    const res = await updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.data : t)));
  };

  const filtered = tasks.filter((t) =>
    filter === 'all' ? true : t.status === filter
  );

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <h1 className="app-title">TASKR</h1>
            <p className="app-sub">Get things done, one task at a time.</p>
          </div>
          <div className="header-stats">
            <span className="stat">{counts.pending} <small>pending</small></span>
            <span className="stat accent">{counts.completed} <small>done</small></span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <TaskForm onAdd={handleAdd} />
        </div>

        <div className="content">
          <div className="filter-bar">
            {['all', 'pending', 'completed'].map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>

          {loading && <p className="state-msg">Loading tasks...</p>}
          {error && <p className="state-msg error">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <p>No {filter !== 'all' ? filter : ''} tasks yet.</p>
              <small>Add one using the form on the left.</small>
            </div>
          )}

          <div className="task-list">
            {filtered.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
