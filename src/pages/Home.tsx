import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BarChart2, CheckSquare, Brain, BookOpen } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to TradeWise</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Your all-in-one trading companion for maintaining focus and discipline
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/timer"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">Focus Timer</h2>
              <p className="text-gray-600 dark:text-gray-300">Stay focused with customizable trading sessions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/statistics"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <BarChart2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <h2 className="text-xl font-semibold">Statistics</h2>
              <p className="text-gray-600 dark:text-gray-300">Track your focus sessions and progress</p>
            </div>
          </div>
        </Link>

        <Link
          to="/checklist"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <CheckSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold">Pre-Trading Checklist</h2>
              <p className="text-gray-600 dark:text-gray-300">Ensure you're ready for each trading session</p>
            </div>
          </div>
        </Link>

        <Link
          to="/tools"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="text-xl font-semibold">Trading Psychology Tools</h2>
              <p className="text-gray-600 dark:text-gray-300">Stay calm and focused during market hours</p>
            </div>
          </div>
        </Link>

        <Link
          to="/journal"
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow col-span-1 md:col-span-2"
        >
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-semibold">Trading Journal</h2>
              <p className="text-gray-600 dark:text-gray-300">Record your thoughts and maintain emotional awareness</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Use TradeWise?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">Stay Focused</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Maintain concentration during critical trading hours
            </p>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">Stay Disciplined</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Follow your trading plan with structured reminders
            </p>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">Stay Mindful</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Maintain emotional awareness throughout your trading day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;