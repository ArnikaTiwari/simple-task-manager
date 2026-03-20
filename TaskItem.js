import React, { useState } from 'react';
import './TaskItem.css';

export default function TaskItem({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!editTitle.trim()) { setError('Title cannot be empty'); return; }
    await onUpdate(task._id, { title: editTitle, description: editDesc });
    setEditing(false);
    setError('');
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditing(false);
    setError('');
  };

  const createdDate = new Date(task.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
      {editing ? (
        <div className="edit-mode">
          <input
            value={editTitle}
            onChange={(e) => { setEditTitle(e.target.value); setError(''); }}
            className={error ? 'edit-input error' : 'edit-input'}
          />
          {error && <span className="error-msg">{error}</span>}
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={2}
            className="edit-textarea"
          />
          <div className="edit-actions">
            <button className="btn-save" onClick={handleSave}>Save</button>
            <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <div className="task-left">
            <button
              className={`toggle-btn ${task.status === 'completed' ? 'done' : ''}`}
              onClick={() => onToggle(task._id)}
              title="Toggle complete"
            >
              {task.status === 'completed' ? '✓' : ''}
            </button>
            <div className="task-content">
              <p className="task-title">{task.title}</p>
              {task.description && <p className="task-desc">{task.description}</p>}
              <span className="task-meta">{createdDate} · <span className={`status-badge ${task.status}`}>{task.status}</span></span>
            </div>
          </div>
          <div className="task-actions">
            <button className="btn-edit" onClick={() => setEditing(true)} title="Edit">✏️</button>
            <button className="btn-delete" onClick={() => onDelete(task._id)} title="Delete">🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}
