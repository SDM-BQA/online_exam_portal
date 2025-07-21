const express = require('express');
const Question = require('../models/Question');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Get all questions (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { subject, topic, difficulty, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    
    const questions = await Question.find(filter)
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const total = await Question.countDocuments(filter);
    
    res.json({ questions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create question (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update question
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete question
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subjects and topics for filters
router.get('/metadata', auth, adminAuth, async (req, res) => {
  try {
    const subjects = await Question.distinct('subject');
    const topics = await Question.distinct('topic');
    res.json({ subjects, topics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
