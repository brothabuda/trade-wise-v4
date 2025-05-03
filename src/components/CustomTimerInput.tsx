import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { Clock, Repeat, Volume2, MessageSquare, Plus, X, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

const TimeWheel: React.FC<{
  value: number;
  onChange: (value: number) => void;
  max: number;
  label: string;
}> = ({ value, onChange, max, label }) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
      >
        {Array.from({ length: max + 1 }, (_, i) => (
          <option key={i} value={i}>
            {i.toString().padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
};

const ReminderItem: React.FC<{
  reminder: { 
    id: string; 
    text: string; 
    isActive: boolean; 
    order: number;
    createdAt: number;
    completedAt?: number;
  };
  onUpdate: (id: string, updates: { text?: string; isActive?: boolean }) => void;
  onRemove: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ reminder, onUpdate, onRemove, onToggleComplete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const isCompleted = !!reminder.completedAt;
  
  const handleMoveUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMoveUp();
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMoveDown();
  };
  
  return (
    <div className={`flex items-center space-x-2 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
      isCompleted ? 'opacity-75' : ''
    }`}>
      <div className="flex flex-col space-y-1">
        <button
          type="button"
          onClick={handleMoveUp}
          disabled={isFirst}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isFirst ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          aria-label="Move up"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleMoveDown}
          disabled={isLast}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isLast ? 'opacity-30 cursor-not-allowed' : ''
          }`}
          aria-label="Move down"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      
      <input
        type="checkbox"
        checked={reminder.isActive}
        onChange={(e) => onUpdate(reminder.id, { isActive: e.target.checked })}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      
      <div className="flex-1">
        <input
          type="text"
          value={reminder.text}
          onChange={(e) => onUpdate(reminder.id, { text: e.target.value })}
          maxLength={100}
          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
            isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''
          }`}
        />
      </div>
      
      <button
        type="button"
        onClick={() => onToggleComplete(reminder.id)}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        }`}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
      
      <button
        type="button"
        onClick={() => onRemove(reminder.id)}
        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Remove reminder"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const CustomTimerInput: React.FC = () => {
  const { 
    startTimer, 
    isRecurring, 
    setIsRecurring, 
    selectedSound, 
    setSelectedSound, 
    soundRepeatCount,
    setSoundRepeatCount,
    availableSounds,
    savedSettings,
    saveSettings,
    reminders,
    addReminder,
    removeReminder,
    updateReminder,
    toggleReminderComplete,
    reorderReminders
  } = useTimer();
  
  const [hours, setHours] = useState(savedSettings.hours);
  const [minutes, setMinutes] = useState(savedSettings.minutes);
  const [seconds, setSeconds] = useState(savedSettings.seconds);
  const [newReminderText, setNewReminderText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const soundDisplayNames = {
    '/Chimes.mp3': 'Chimes (longer duration sound)',
    '/Crystal.mp3': 'Crystal',
    '/Deep Copper Bell.mp3': 'Deep Copper Bell',
    '/High Bell.mp3': 'High Bell'
  };
  
  useEffect(() => {
    saveSettings({
      ...savedSettings,
      hours,
      minutes,
      seconds,
      isRecurring: true,
      selectedSound,
      soundRepeatCount,
      reminders
    });
  }, [hours, minutes, seconds, selectedSound, soundRepeatCount, reminders, saveSettings, savedSettings]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      startTimer(totalSeconds, 'custom', true);
    }
  };

  const handleSoundPreview = () => {
    const audio = new Audio(selectedSound);
    audio.play().catch(err => console.error('Error playing audio:', err));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReminderText.trim() && !isAdding) {
      setIsAdding(true);
      try {
        addReminder(newReminderText.trim());
        setNewReminderText('');
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddReminder(e);
    }
  };

  const moveReminder = (fromIndex: number, toIndex: number) => {
    const updatedReminders = [...reminders].sort((a, b) => a.order - b.order);
    const [movedItem] = updatedReminders.splice(fromIndex, 1);
    updatedReminders.splice(toIndex, 0, movedItem);
    
    const reorderedReminders = updatedReminders.map((reminder, index) => ({
      ...reminder,
      order: index
    }));
    
    reorderReminders(reorderedReminders);
  };

  const sortedReminders = [...reminders].sort((a, b) => a.order - b.order);
  
  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <TimeWheel value={hours} onChange={setHours} max={23} label="Hours" />
          <TimeWheel value={minutes} onChange={setMinutes} max={59} label="Minutes" />
          <TimeWheel value={seconds} onChange={setSeconds} max={59} label="Seconds" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timer Sound
            </label>
            <div className="flex space-x-2">
              <select
                value={selectedSound}
                onChange={(e) => setSelectedSound(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
              >
                {availableSounds.map((sound) => (
                  <option key={sound} value={sound}>
                    {soundDisplayNames[sound as keyof typeof soundDisplayNames]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSoundPreview}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Preview sound"
              >
                <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Rings
            </label>
            <select
              value={soundRepeatCount}
              onChange={(e) => setSoundRepeatCount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value={1}>1 time</option>
              <option value={2}>2 times</option>
              <option value={3}>3 times</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Trading Reminders</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add new reminder..."
                  maxLength={100}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddReminder}
                  className={`p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ${
                    isAdding ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!newReminderText.trim() || isAdding}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-900">
              {sortedReminders.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                  No reminders yet. Add your first reminder above.
                </p>
              ) : (
                sortedReminders.map((reminder, index) => (
                  <ReminderItem
                    key={reminder.id}
                    reminder={reminder}
                    onUpdate={updateReminder}
                    onRemove={removeReminder}
                    onToggleComplete={toggleReminderComplete}
                    onMoveUp={() => moveReminder(index, index - 1)}
                    onMoveDown={() => moveReminder(index, index + 1)}
                    isFirst={index === 0}
                    isLast={index === sortedReminders.length - 1}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={(hours === 0 && minutes === 0 && seconds === 0)}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="h-5 w-5" />
          <span>Start Timer</span>
        </button>
      </form>
    </div>
  );
};

export default CustomTimerInput;