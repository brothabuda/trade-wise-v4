import React from 'react';

const Checklist: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pre-Trading Checklist</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Ensure you're prepared for each trading session
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Checklist features coming soon...
        </p>
      </div>
    </div>
  );
};

export default Checklist;