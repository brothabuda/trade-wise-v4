import React from 'react';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import CustomTimerInput from './CustomTimerInput';
import ReminderPopup from './ReminderPopup';
import EmotionalTracker from './EmotionalTracker';
import EmotionalRatingPopup from './EmotionalRatingPopup';
import CombinedPopup from './CombinedPopup';
import ReminderSettingsCard from './ReminderSettingsCard';
import { useTimer } from '../context/TimerContext';

const TimerDashboard: React.FC = () => {
  const { 
    status, 
    showReminder, 
    setShowReminder, 
    showEmotionalTracker, 
    setShowEmotionalTracker,
    trackEmotionalReactivity
  } = useTimer();
  
  // Determine when to show the combined popup
  const showCombinedPopup = showReminder && showEmotionalTracker && trackEmotionalReactivity;
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <TimerDisplay />
            <TimerControls />
            {status === 'idle' && <CustomTimerInput />}
          </div>
          {status === 'idle' && <ReminderSettingsCard />}
          {status === 'idle' && <EmotionalTracker />}
        </div>
      </div>
      
      {/* Show Combined Popup when both reminder and emotional tracking are needed */}
      {showCombinedPopup && <CombinedPopup />}
      
      {/* Show regular Reminder Popup when only reminder is needed */}
      {showReminder && !showCombinedPopup && <ReminderPopup />}
      
      {/* Show regular Emotional Rating Popup when only emotional tracking is needed */}
      {showEmotionalTracker && !showReminder && <EmotionalRatingPopup onDismiss={() => setShowEmotionalTracker(false)} />}
    </div>
  );
};

export default TimerDashboard;