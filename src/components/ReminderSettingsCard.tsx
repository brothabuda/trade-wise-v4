import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';
import { MessageSquare, Plus, X, ChevronUp, ChevronDown, CheckCircle2, BookOpen } from 'lucide-react';
import type { Reminder } from '../context/TimerContext'; // We might need to export this from TimerContext or redefine
import ReminderBankPopup from './ReminderBankPopup'; // Import the popup

// Definition for ReminderItem (moved from CustomTimerInput.tsx)
const ReminderItem: React.FC<{
  reminder: Reminder; // Using Reminder type from context if possible
  onUpdate: (id: string, updates: { text?: string; isActive?: boolean }) => void;
  onRemove: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  displayOrder: number; // New prop for display order
}> = ({ reminder, onUpdate, onRemove, onToggleComplete, onMoveUp, onMoveDown, isFirst, isLast, displayOrder }) => {
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
      
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6 text-left pl-1">{displayOrder}.</span>
      
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

const ReminderSettingsCard: React.FC = () => {
  const {
    reminders, // These are the activeSessionReminders
    addReminderToBank,
    toggleReminderActive,
    updateReminderInBank,
    deleteReminderFromBank,
    toggleReminderComplete,
    reorderReminders, 
  } = useTimer();

  const [newReminderText, setNewReminderText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isBankPopupOpen, setIsBankPopupOpen] = useState(false); // State for popup visibility


  const handleAddNewReminderToList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReminderText.trim() && !isAdding) {
      setIsAdding(true);
      try {
        const newReminderId = addReminderToBank(newReminderText.trim());
        if (newReminderId) {
          toggleReminderActive(newReminderId); // Activate it for the current session
        }
        setNewReminderText('');
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleKeyPressNewReminder = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNewReminderToList(e as any); // Cast needed as FormEvent is expected
    }
  };

  const handleUpdateListedReminder = (id: string, updates: { text?: string; isActive?: boolean }) => {
    if (updates.text !== undefined) {
      updateReminderInBank(id, updates.text);
    }
    if (updates.isActive !== undefined) {
      // If we are deactivating via this list's checkbox, it means removing from active.
      // If we are activating, it means adding to active.
      // toggleReminderActive handles both cases correctly.
      toggleReminderActive(id);
    }
  };

  const handleRemoveListedReminder = (id: string) => {
    // This should just deactivate it from the current session.
    // Deleting from bank will be handled in the bank popup.
    // So, we call toggleReminderActive if it's currently active.
    // The `deleteReminderFromBank` also deactivates, so if we want to keep it in bank,
    // we should only call toggleReminderActive if it's currently active.
    const reminderIsActive = reminders.find(r => r.id === id)?.isActive;
    if (reminderIsActive) {
        toggleReminderActive(id); // Deactivates it
    }
    // If the intention of the X button in this list is to remove from bank, then use deleteReminderFromBank(id);
    // For now, let's make it "remove from active session" (deactivate)
  };
  
  // This function reorders the active reminders
   const moveListedReminder = (fromIndex: number, toIndex: number) => {
    const activeRemindersForReorder = [...reminders].sort((a, b) => a.order - b.order);
    const [movedItem] = activeRemindersForReorder.splice(fromIndex, 1);
    activeRemindersForReorder.splice(toIndex, 0, movedItem);
    
    // Update the order property for all, then pass only IDs to reorderReminders
    const newOrderedIds = activeRemindersForReorder.map(r => r.id);
    reorderReminders(newOrderedIds);
  };

  const sortedActiveReminders = [...reminders].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Trading Reminders</span>
        </label>
        <button 
          onClick={() => setIsBankPopupOpen(true)} 
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center space-x-1 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
        >
          <BookOpen size={16} />
          <span>Reminder Bank</span>
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newReminderText}
          onChange={(e) => setNewReminderText(e.target.value)}
          onKeyPress={handleKeyPressNewReminder}
          placeholder="Add new reminder to session..."
          maxLength={100}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAddNewReminderToList}
          className={`p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors ${
            isAdding || !newReminderText.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!newReminderText.trim() || isAdding}
          aria-label="Add reminder to active session"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-900/50">
        {sortedActiveReminders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
            No active reminders for this session. Add one above or from the bank.
          </p>
        ) : (
          sortedActiveReminders.map((reminder, index) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onUpdate={handleUpdateListedReminder}
              onRemove={handleRemoveListedReminder}
              onToggleComplete={toggleReminderComplete}
              onMoveUp={() => moveListedReminder(index, index - 1)}
              onMoveDown={() => moveListedReminder(index, index + 1)}
              isFirst={index === 0}
              isLast={index === sortedActiveReminders.length - 1}
              displayOrder={index + 1}
            />
          ))
        )}
      </div>
      <ReminderBankPopup isOpen={isBankPopupOpen} onClose={() => setIsBankPopupOpen(false)} />
    </div>
  );
};

export default ReminderSettingsCard; 