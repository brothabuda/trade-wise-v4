import React from 'react';
import { useTimer } from '../context/TimerContext';
import { useTheme } from '../context/ThemeContext';

const TimerDisplay: React.FC = () => {
  const { timeDisplay, status, progress } = useTimer();
  const { isDarkMode } = useTheme();
  
  // Define colors based on timer status and theme
  const getTimerColor = () => {
    if (status === 'completed') return 'text-green-500 dark:text-green-400';
    if (status === 'running') return 'text-blue-600 dark:text-blue-400';
    if (status === 'paused') return 'text-amber-500 dark:text-amber-400';
    return 'text-gray-700 dark:text-gray-300';
  };
  
  return (
    <div className="mb-6 text-center">
      <div className="relative h-32 w-32 mx-auto mb-2">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          {progress > 0 && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={isDarkMode ? '#3B82F6' : '#2563EB'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-in-out"
            />
          )}
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={`text-2xl font-bold ${getTimerColor()}`}>
            {timeDisplay}
          </p>
        </div>
      </div>
      
      {/* Status text */}
      <p className="text-sm font-medium capitalize text-gray-600 dark:text-gray-400">
        {status === 'completed'
          ? 'Well done!'
          : status !== 'idle' && `Timer ${status}`}
      </p>
    </div>
  );
};

export default TimerDisplay;