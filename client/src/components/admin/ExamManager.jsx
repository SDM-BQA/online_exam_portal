import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
    duration: 60,
    startTime: '',
    endTime: '',
    isActive: false,
    assignedStudents: []
  });

  useEffect(() => {
    fetchExams();
    fetchQuestions();
    fetchStudents();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams/admin');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/questions');
      setQuestions(response.data.questions || response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/auth/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingExam) {
        await axios.put(`/api/exams/${editingExam._id}`, formData);
      } else {
        await axios.post('/api/exams', formData);
      }
      
      fetchExams();
      resetForm();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error saving exam: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      questions: [],
      duration: 60,
      startTime: '',
      endTime: '',
      isActive: false,
      assignedStudents: []
    });
    setShowForm(false);
    setEditingExam(null);
  };

  const editExam = (exam) => {
    setFormData({
      title: exam.title,
      description: exam.description || '',
      questions: exam.questions.map(q => q._id || q),
      duration: exam.duration,
      startTime: new Date(exam.startTime).toISOString().slice(0, 16),
      endTime: new Date(exam.endTime).toISOString().slice(0, 16),
      isActive: exam.isActive,
      assignedStudents: exam.assignedStudents.map(s => s._id || s)
    });
    setEditingExam(exam);
    setShowForm(true);
  };

  const deleteExam = async (id) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await axios.delete(`/api/exams/${id}`);
        fetchExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const toggleExamStatus = async (examId, currentStatus) => {
    try {
      await axios.put(`/api/exams/${examId}`, { isActive: !currentStatus });
      fetchExams();
    } catch (error) {
      console.error('Error updating exam status:', error);
    }
  };

  const handleQuestionToggle = (questionId) => {
    const updatedQuestions = formData.questions.includes(questionId)
      ? formData.questions.filter(id => id !== questionId)
      : [...formData.questions, questionId];
    
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleStudentToggle = (studentId) => {
    const updatedStudents = formData.assignedStudents.includes(studentId)
      ? formData.assignedStudents.filter(id => id !== studentId)
      : [...formData.assignedStudents, studentId];
    
    setFormData({ ...formData, assignedStudents: updatedStudents });
  };

  const getTotalMarks = () => {
    return formData.questions.reduce((total, questionId) => {
      const question = questions.find(q => q._id === questionId);
      return total + (question?.marks || 0);
    }, 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Exam Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Create New Exam'}
        </button>
      </div>

      {/* Exam Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingExam ? 'Edit Exam' : 'Create New Exam'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Exam Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  min="1"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Activate Exam
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Question Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Select Questions ({formData.questions.length} selected, {getTotalMarks()} marks total)
              </label>
              <div className="border rounded-lg max-h-60 overflow-y-auto">
                {questions.map((question) => (
                  <div key={question._id} className="flex items-start p-3 border-b hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.questions.includes(question._id)}
                      onChange={() => handleQuestionToggle(question._id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm text-gray-900">{question.question}</p>
                        <div className="text-xs text-gray-500">
                          {question.marks} marks | {question.subject}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {question.type.toUpperCase()} | {question.difficulty}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Assignment */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Assign to Students ({formData.assignedStudents.length} selected)
              </label>
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {students.map((student) => (
                  <div key={student._id} className="flex items-center p-2 border-b hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.assignedStudents.includes(student._id)}
                      onChange={() => handleStudentToggle(student._id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingExam ? 'Update Exam' : 'Create Exam')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                      {exam.description && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">{exam.description}</div>
                      )}
                      <div className="text-xs text-gray-500">{exam.duration} minutes</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{exam.questions?.length || 0} questions</div>
                    <div className="text-xs text-gray-500">
                      {exam.questions?.reduce((total, q) => total + (q.marks || 0), 0)} marks
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-900">
                      Start: {new Date(exam.startTime).toLocaleDateString()} {new Date(exam.startTime).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      End: {new Date(exam.endTime).toLocaleDateString()} {new Date(exam.endTime).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleExamStatus(exam._id, exam.isActive)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        exam.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {exam.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{exam.assignedStudents?.length || 0} assigned</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => editExam(exam)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteExam(exam._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exams.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Created</h3>
            <p className="text-gray-600">Create your first exam to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManager;
