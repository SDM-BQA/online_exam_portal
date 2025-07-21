import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams/student');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const isExamAvailable = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    return now >= startTime && now <= endTime && exam.isActive;
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    if (!exam.isActive) return { status: 'Inactive', color: 'gray' };
    if (now < startTime) return { status: 'Upcoming', color: 'blue' };
    if (now > endTime) return { status: 'Expired', color: 'red' };
    return { status: 'Active', color: 'green' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">My Exams</h2>
          
          {exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-500 text-lg mb-2">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Available</h3>
              <p className="text-gray-600">You don't have any exams assigned yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => {
                const examStatus = getExamStatus(exam);
                const canTakeExam = isExamAvailable(exam);
                
                return (
                  <div key={exam._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {exam.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          examStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          examStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          examStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {examStatus.status}
                        </span>
                      </div>
                      
                      {exam.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {exam.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm text-gray-500 mb-6">
                        <div className="flex items-center">
                          <span className="mr-2">⏱️</span>
                          <span>Duration: {exam.duration} minutes</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">❓</span>
                          <span>Questions: {exam.questions?.length || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">📅</span>
                          <span>Start: {new Date(exam.startTime).toLocaleDateString()} at {new Date(exam.startTime).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">🏁</span>
                          <span>End: {new Date(exam.endTime).toLocaleDateString()} at {new Date(exam.endTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => startExam(exam._id)}
                        disabled={!canTakeExam}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition duration-200 ${
                          canTakeExam
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canTakeExam ? 'Start Exam' : 'Not Available'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
