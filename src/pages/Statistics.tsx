import React from 'react';
import StatisticsPage from '../components/StatisticsPage';

const Statistics: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Track your focus sessions and trading discipline metrics
      </p>
      
      <div className="space-y-6">
        <StatisticsPage />
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Session Statistics</h2>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Additional statistics features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;