import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { X, Edit3, Trash2, PlusCircle, CheckSquare, Square } from 'lucide-react';
import type { BankedReminder } from '../context/TimerContext'; // Assuming BankedReminder is exported

interface ReminderBankPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReminderBankPopup: React.FC<ReminderBankPopupProps> = ({ isOpen, onClose }) => {
  const {
    reminderBank,
    activeReminderIds,
    addReminderToBank,
    updateReminderInBank,
    deleteReminderFromBank,
    toggleReminderActive,
  } = useTimer();

  const [newBankReminderText, setNewBankReminderText] = useState('');
  const [editingReminder, setEditingReminder] = useState<BankedReminder | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (editingReminder) {
      setEditText(editingReminder.text);
    } else {
      setEditText('');
    }
  }, [editingReminder]);

  if (!isOpen) return null;

  const handleAddOrUpdate = () => {
    if (editingReminder) {
      if (editText.trim()) {
        updateReminderInBank(editingReminder.id, editText.trim());
        setEditingReminder(null);
      }
    } else {
      if (newBankReminderText.trim()) {
        addReminderToBank(newBankReminderText.trim());
        setNewBankReminderText('');
      }
    }
  };
  
  const startEdit = (reminder: BankedReminder) => {
    setEditingReminder(reminder);
  };

  const cancelEdit = () => {
    setEditingReminder(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Reminder Bank</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        {/* Add/Edit Form */}
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
            {editingReminder ? 'Edit Reminder' : 'Add New Reminder to Bank'}
          </h3>
          <div className="flex space-x-2">
            <input 
              type="text"
              value={editingReminder ? editText : newBankReminderText}
              onChange={(e) => editingReminder ? setEditText(e.target.value) : setNewBankReminderText(e.target.value)}
              placeholder={editingReminder ? 'Edit reminder text...' : 'Enter new reminder text...'}
              maxLength={100}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button 
              onClick={handleAddOrUpdate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-2 transition-colors disabled:opacity-50"
              disabled={editingReminder ? !editText.trim() : !newBankReminderText.trim()}
            >
              {editingReminder ? <CheckSquare size={20}/> : <PlusCircle size={20} />}
              <span>{editingReminder ? 'Save' : 'Add'}</span>
            </button>
            {editingReminder && (
              <button 
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Banked Reminders List */}
        <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Your Saved Reminders</h3>
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {reminderBank.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Your reminder bank is empty.</p>
          ) : (
            reminderBank.map((bankedReminder) => {
              const isActive = activeReminderIds.includes(bankedReminder.id);
              return (
                <div 
                  key={bankedReminder.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
                      : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button onClick={() => toggleReminderActive(bankedReminder.id)} aria-label={isActive ? 'Deactivate' : 'Activate'}>
                      {isActive ? <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" /> : <Square size={20} className="text-gray-400 dark:text-gray-500" />}
                    </button>
                    <p className={`text-sm truncate ${isActive ? 'font-medium text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                      {bankedReminder.text}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-2">
                    <button 
                      onClick={() => startEdit(bankedReminder)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      aria-label="Edit reminder"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteReminderFromBank(bankedReminder.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      aria-label="Delete reminder from bank"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderBankPopup; 