import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsView = () => {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSubmissions: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchResults(selectedExam);
    }
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams/admin');
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchResults = async (examId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/exams/${examId}/results`);
      setResults(response.data);
      calculateStatistics(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (resultsData) => {
    if (resultsData.length === 0) {
      setStatistics({
        totalSubmissions: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0
      });
      return;
    }

    const scores = resultsData.map(result => (result.obtainedMarks / result.totalMarks) * 100);
    const totalSubmissions = resultsData.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalSubmissions;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passRate = (scores.filter(score => score >= 60).length / totalSubmissions) * 100;

    setStatistics({
      totalSubmissions,
      averageScore: averageScore.toFixed(1),
      highestScore: highestScore.toFixed(1),
      lowestScore: lowestScore.toFixed(1),
      passRate: passRate.toFixed(1)
    });
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const exportResults = () => {
    if (results.length === 0) return;

    const csvContent = [
      ['Student Name', 'Email', 'Score', 'Total Marks', 'Percentage', 'Grade', 'Submitted At'],
      ...results.map(result => {
        const percentage = ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1);
        const { grade } = getGrade(percentage);
        return [
          result.student.name,
          result.student.email,
          result.obtainedMarks,
          result.totalMarks,
          `${percentage}%`,
          grade,
          new Date(result.submittedAt).toLocaleString()
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${selectedExam}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Exam Results</h2>
        {results.length > 0 && (
          <button
            onClick={exportResults}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Exam Selection */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium mb-2">Select Exam</label>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full max-w-md px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="">Choose an exam...</option>
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>
              {exam.title} ({new Date(exam.startTime).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {selectedExam && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalSubmissions}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-700">{statistics.highestScore}%</div>
              <div className="text-sm text-gray-600">Highest Score</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.lowestScore}%</div>
              <div className="text-sm text-gray-600">Lowest Score</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-purple-600">{statistics.passRate}%</div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading results...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result) => {
                      const percentage = ((result.obtainedMarks / result.totalMarks) * 100).toFixed(1);
                      const { grade, color } = getGrade(parseFloat(percentage));
                      
                      return (
                        <tr key={result._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{result.student.name}</div>
                              <div className="text-sm text-gray-500">{result.student.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.obtainedMarks} / {result.totalMarks}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{percentage}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-bold ${color}`}>{grade}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.submittedAt).toLocaleDateString()}<br/>
                            {new Date(result.submittedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => alert('Detailed view coming soon!')}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                <p className="text-gray-600">No students have taken this exam yet.</p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedExam && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-500 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Select an Exam</h3>
          <p className="text-gray-600">Choose an exam from the dropdown above to view results and statistics.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsView;
