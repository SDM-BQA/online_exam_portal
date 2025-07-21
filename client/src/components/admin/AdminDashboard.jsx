import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import QuestionManager from './QuestionManager';
import ExamManager from './ExamManager';
import ResultsView from './ResultsView';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const { user, logout } = useAuth();

  const tabs = [
    { id: 'questions', label: 'Questions', icon: '❓' },
    { id: 'exams', label: 'Exams', icon: '📝' },
    { id: 'results', label: 'Results', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'questions' && <QuestionManager />}
          {activeTab === 'exams' && <ExamManager />}
          {activeTab === 'results' && <ResultsView />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
