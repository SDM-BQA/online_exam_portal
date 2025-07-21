const express = require('express');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');
const Question = require('../models/Question');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Create exam (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all exams (admin only)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('questions', 'question subject marks')
      .populate('assignedStudents', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get exams for student (student only)
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Student access required' });
    }
    
    const exams = await Exam.find({
      assignedStudents: req.user.userId,
      isActive: true
    }).populate('questions', 'question type marks');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single exam for taking (student only)
router.get('/:id/take', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Student access required' });
    }

    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'questions',
        select: 'question type options marks subject topic'
      });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (!exam.assignedStudents.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Not authorized to take this exam' });
    }

    if (!exam.isActive) {
      return res.status(400).json({ error: 'Exam is not active' });
    }

    // Check if already submitted
    const existingResult = await ExamResult.findOne({
      exam: req.params.id,
      student: req.user.userId,
      status: 'completed'
    });

    if (existingResult) {
      return res.status(400).json({ error: 'Exam already submitted' });
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit exam (student only)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Student access required' });
    }

    const { answers } = req.body;
    const exam = await Exam.findById(req.params.id).populate('questions');
    
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    let obtainedMarks = 0;
    const processedAnswers = [];

    for (const [questionId, answer] of Object.entries(answers)) {
      const question = exam.questions.find(q => q._id.toString() === questionId);
      if (question) {
        const isCorrect = question.correctAnswer.toLowerCase() === answer.toLowerCase();
        const marks = isCorrect ? question.marks : 0;
        obtainedMarks += marks;

        processedAnswers.push({
          question: questionId,
          answer,
          isCorrect,
          marks
        });
      }
    }

    const totalMarks = exam.questions.reduce((sum, q) => sum + q.marks, 0);

    const result = await ExamResult.create({
      exam: req.params.id,
      student: req.user.userId,
      answers: processedAnswers,
      totalMarks,
      obtainedMarks,
      status: 'completed'
    });

    res.json({ result, score: `${obtainedMarks}/${totalMarks}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get exam results (admin only)
router.get('/:id/results', auth, adminAuth, async (req, res) => {
  try {
    const results = await ExamResult.find({ exam: req.params.id })
      .populate('student', 'name email')
      .populate('exam', 'title')
      .sort({ obtainedMarks: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update exam (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete exam (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
