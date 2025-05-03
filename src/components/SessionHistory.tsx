import React from 'react';
import { useTimer } from '../context/TimerContext';
import { formatTime } from '../utils/timerUtils';
import { History, CheckCircle2 } from 'lucide-react';

const SessionHistory: React.FC = () => {
  const { sessions } = useTimer();
  
  // Sort sessions with most recent first
  const sortedSessions = [...sessions].sort((a, b) => {
    const aTime = a.completedAt ? a.completedAt.getTime() : Date.now();
    const bTime = b.completedAt ? b.completedAt.getTime() : Date.now();
    return bTime - aTime;
  });
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center mb-4">
        <History className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-medium">Session History</h3>
      </div>
      
      {sortedSessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
          No sessions yet. Start a timer to begin tracking.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {sortedSessions.map((session) => (
            <div 
              key={session.id}
              className={`p-3 rounded-lg border ${
                session.completedAt 
                  ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20' 
                  : 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    {session.completedAt && (
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                    )}
                    <span className="font-medium">
                      {session.preset === 'custom' ? 'Custom' : session.preset} timer
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTime(session.duration)} duration
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {session.completedAt ? (
                    <span>Completed at {session.completedAt.toLocaleTimeString()}</span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400">In progress</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;