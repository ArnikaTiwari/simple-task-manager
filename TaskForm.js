import React, { useState } from 'react';
import './TaskForm.css';

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onAdd({ title, description });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">New Task</h2>
      <div className="field">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          className={error ? 'input-error' : ''}
          maxLength={100}
        />
        {error && <span className="error-msg">{error}</span>}
      </div>
      <div className="field">
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
        />
      </div>
      <button type="submit" className="btn-add" disabled={loading}>
        {loading ? 'Adding...' : '+ Add Task'}
      </button>
    </form>
  );
}
