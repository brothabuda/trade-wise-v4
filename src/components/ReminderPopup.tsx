import React from 'react';
import { Check } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const ReminderPopup: React.FC = () => {
  const { reminders, currentReminderIndex, handleReminderDismiss } = useTimer();
  
  const activeReminders = reminders.filter(r => r.isActive && !r.completedAt)
    .sort((a, b) => a.order - b.order);
  
  const currentReminder = activeReminders[currentReminderIndex];
  
  if (!currentReminder) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all duration-200 scale-100 opacity-100">
        <p className="text-lg text-gray-700 dark:text-gray-200 text-center mb-6">
          {currentReminder.text}
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleReminderDismiss}
            className="flex items-center space-x-2 px-6 py-2 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-lg transition-colors duration-200 shadow-sm"
          >
            <Check className="h-5 w-5" />
            <span>Okay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderPopup;