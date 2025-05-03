import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const CombinedPopup: React.FC = () => {
  const { 
    addEmotionalRating, 
    reminders, 
    currentReminderIndex, 
    handleReminderDismiss 
  } = useTimer();
  
  const [rating, setRating] = useState(5);
  const [isVisible, setIsVisible] = useState(false);

  // Get the current reminder
  const activeReminders = reminders.filter(r => r.isActive && !r.completedAt)
    .sort((a, b) => a.order - b.order);
  
  const currentReminder = activeReminders[currentReminderIndex];
  const totalReminders = activeReminders.length;
  const reminderPosition = totalReminders > 0 ? currentReminderIndex + 1 : 0;
  
  // Add animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    addEmotionalRating(rating);
    handleReminderDismiss();
  };

  if (!currentReminder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transition-all duration-300 ${isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}>
        {/* Reminder Section */}
        <div className="mb-8 border-b dark:border-gray-700 pb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Reminder</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {reminderPosition} of {totalReminders}
              </span>
              <div className="flex space-x-1">
                {Array.from({ length: totalReminders }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full ${index === currentReminderIndex ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    aria-label={index === currentReminderIndex ? 'Current reminder' : `Reminder ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-lg text-gray-700 dark:text-gray-200 text-center">
            {currentReminder.text}
          </p>
        </div>
        
        {/* Emotional Reactivity Section */}
        <div className="space-y-5">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">How emotionally reactive are you feeling right now?</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">Completely calm & focused</span>
              <span className="text-red-600 dark:text-red-400">Highly reactive & emotional</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="emotional-slider w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>Save and Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedPopup; 