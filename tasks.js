const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks — Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// POST /api/tasks — Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const task = await Task.create({ title: title.trim(), description: description?.trim() });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/tasks/:id — Update a task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title: title?.trim(), description: description?.trim(), status },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/tasks/:id/toggle — Toggle task status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = task.status === 'pending' ? 'completed' : 'pending';
    await task.save();

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
