import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { Clock, Repeat, Volume2 } from 'lucide-react';

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

const CustomTimerInput: React.FC = () => {
  const { 
    startTimer, 
    isRecurring,
    selectedSound, 
    setSelectedSound, 
    soundRepeatCount,
    setSoundRepeatCount,
    availableSounds,
    savedSettings,
    saveSettings,
    activeReminderIds
  } = useTimer();
  
  const [hours, setHours] = useState(savedSettings.hours);
  const [minutes, setMinutes] = useState(savedSettings.minutes);
  const [seconds, setSeconds] = useState(savedSettings.seconds);

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
      isRecurring,
      selectedSound,
      soundRepeatCount,
      activeReminderIds
    });
  }, [hours, minutes, seconds, isRecurring, selectedSound, soundRepeatCount, activeReminderIds, saveSettings, savedSettings]);
  
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