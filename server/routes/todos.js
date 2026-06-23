const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

router.get('/', async (req, res) => {
  try {
    const { q, sort, order } = req.query;
    const filter = {};
    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }
    const sortField = sort || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const todos = await Todo.find(filter).sort({ [sortField]: sortOrder });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const todo = await Todo.create({ title: req.body.title, priority: req.body.priority });
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!todo) return res.status(404).json({ error: '任务不存在' });
    res.json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: '任务不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
