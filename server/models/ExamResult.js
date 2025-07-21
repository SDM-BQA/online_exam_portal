const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: String,
    isCorrect: Boolean,
    marks: Number
  }],
  totalMarks: Number,
  obtainedMarks: Number,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['completed', 'in-progress'], default: 'completed' }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);
