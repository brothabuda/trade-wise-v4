import React from 'react';
import { Play, Pause, RotateCcw, RefreshCw, Square } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const TimerControls: React.FC = () => {
  const { status, seconds, pauseTimer, resumeTimer, resetTimer, stopTimer } = useTimer();
  
  // Only show controls if we have an active timer
  if (status === 'idle' && seconds === 0) {
    return null;
  }
  
  return (
    <div className="flex justify-center space-x-4 mb-6">
      {status === 'running' && (
        <button
          onClick={pauseTimer}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 transition-colors shadow-md flex items-center space-x-2"
          aria-label="Pause timer"
        >
          <Pause className="h-5 w-5" />
          <span>Pause</span>
        </button>
      )}
      
      {status === 'paused' && (
        <button
          onClick={resumeTimer}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 transition-colors shadow-md flex items-center space-x-2"
          aria-label="Resume timer"
        >
          <Play className="h-5 w-5" />
          <span>Resume</span>
        </button>
      )}
      
      {status === 'completed' && (
        <button
          onClick={resetTimer}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 transition-colors shadow-md flex items-center space-x-2"
          aria-label="New timer"
        >
          <RefreshCw className="h-5 w-5" />
          <span>New Timer</span>
        </button>
      )}
      
      {(status === 'running' || status === 'paused') && (
        <>
          <button
            onClick={resetTimer}
            className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-4 transition-colors shadow-md flex items-center space-x-2"
            aria-label="Reset timer"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={stopTimer}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 transition-colors shadow-md flex items-center space-x-2"
            aria-label="Stop timer"
          >
            <Square className="h-5 w-5" />
            <span>Stop</span>
          </button>
        </>
      )}
    </div>
  );
};

export default TimerControls;