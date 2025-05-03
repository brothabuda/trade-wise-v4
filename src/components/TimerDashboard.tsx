import React from 'react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import MindfulnessPrompt from './MindfulnessPrompt';
import SessionHistory from './SessionHistory';
import CustomTimerInput from './CustomTimerInput';
import ReminderPopup from './ReminderPopup';
import EmotionalTracker from './EmotionalTracker';
import EmotionalRatingPopup from './EmotionalRatingPopup';
import { useTimer } from '../context/TimerContext';

const TimerDashboard: React.FC = () => {
  const { status, showReminder, setShowReminder, showEmotionalTracker, setShowEmotionalTracker } = useTimer();
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <TimerDisplay />
            <TimerControls />
            {status === 'idle' && <CustomTimerInput />}
          </div>
          <EmotionalTracker />
          <MindfulnessPrompt />
        </div>
        <div className="md:col-span-1">
          <SessionHistory />
        </div>
      </div>
      
      {showReminder && (
        <ReminderPopup />
      )}
      
      {showEmotionalTracker && !showReminder && (
        <EmotionalRatingPopup
          onDismiss={() => setShowEmotionalTracker(false)}
        />
      )}
    </div>
  );
};

export default TimerDashboard;