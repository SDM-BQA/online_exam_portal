import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && exam && !submitting) {
      submitExam();
    }
  }, [timeLeft]);

  const fetchExam = async () => {
    try {
      const response = await axios.get(`/api/exams/${examId}/take`);
      setExam(response.data);
      setTimeLeft(response.data.duration * 60);
    } catch (error) {
      console.error('Error fetching exam:', error);
      alert(error.response?.data?.error || 'Failed to load exam');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
  };

  const submitExam = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const response = await axios.post(`/api/exams/${examId}/submit`, { answers });
      alert(`Exam submitted successfully! Score: ${response.data.score}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!exam) return null;

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`text-lg font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏰ {formatTime(timeLeft)}
              </div>
              <button
                onClick={submitExam}
                disabled={submitting}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Question Navigation */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <h3 className="font-semibold mb-4 text-gray-900">Questions</h3>
              <div className="grid grid-cols-4 gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded text-sm font-medium transition-all duration-200 ${
                      currentQuestion === index
                        ? 'bg-blue-500 text-white shadow-lg'
                        : answers[exam.questions[index]._id]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  <span>Not answered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Question {currentQuestion + 1} of {exam.questions.length}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </span>
                </div>
                
                <div className="prose max-w-none mb-8">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    {question.question}
                  </p>
                </div>

                {/* Answer Options */}
                <div className="space-y-4">
                  {question.type === 'mcq' && (
                    <div className="space-y-3">
                      {question.options.map((option, index) => (
                        <label 
                          key={index} 
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        >
                          <input
                            type="radio"
                            name={question._id}
                            value={option}
                            checked={answers[question._id] === option}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            className="form-radio text-blue-500 mt-1"
                          />
                          <span className="text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'boolean' && (
                    <div className="space-y-3">
                      {['True', 'False'].map((option) => (
                        <label 
                          key={option}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        >
                          <input
                            type="radio"
                            name={question._id}
                            value={option.toLowerCase()}
                            checked={answers[question._id] === option.toLowerCase()}
                            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                            className="form-radio text-blue-500"
                          />
                          <span className="text-gray-800">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'short' && (
                    <div>
                      <textarea
                        value={answers[question._id] || ''}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        className="w-full p-4 border rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        rows="6"
                        placeholder="Type your answer here..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>
                
                <span className="text-sm text-gray-600">
                  {Object.keys(answers).length} of {exam.questions.length} answered
                </span>
                
                <button
                  onClick={nextQuestion}
                  disabled={currentQuestion === exam.questions.length - 1}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
