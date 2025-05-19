import React, { useState, useEffect, useRef } from 'react';
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
    activeReminderIds,
    volume,
    setVolume
  } = useTimer();
  
  const [hours, setHours] = useState(savedSettings.hours);
  const [minutes, setMinutes] = useState(savedSettings.minutes);
  const [seconds, setSeconds] = useState(savedSettings.seconds);
  const [showVolume, setShowVolume] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      activeReminderIds,
      volume
    });
  }, [hours, minutes, seconds, isRecurring, selectedSound, soundRepeatCount, activeReminderIds, volume, saveSettings, savedSettings]);

  useEffect(() => {
    if (!showVolume) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        setShowVolume(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVolume]);

  useEffect(() => {
    if (selectedSound) {
      audioRef.current = new Audio(selectedSound);
      audioRef.current.volume = volume;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSound, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      // Sound will be played onMouseUp
    }
  };

  const playPreviewSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Error playing preview sound:", err));
    }
  };

  const handleSoundPreviewToggle = () => {
    setShowVolume(prev => {
      if (!prev) { // If opening
        playPreviewSound();
      }
      return !prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      startTimer(totalSeconds, 'custom', true);
    }
  };

  return (
    <div className="mt-8">
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timer Sound
          </label>
          <div className="flex space-x-2 items-center relative">
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
            <div ref={sliderRef} className="relative">
              <button
                type="button"
                onClick={handleSoundPreviewToggle}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Preview and adjust volume"
              >
                <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              {showVolume && (
                <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    onMouseUp={playPreviewSound}
                    className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100}%, #E5E7EB ${volume * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-center">{Math.round(volume * 100)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex space-x-2">
          <TimeWheel value={hours} onChange={setHours} max={23} label="Hours" />
          <TimeWheel value={minutes} onChange={setMinutes} max={59} label="Minutes" />
          <TimeWheel value={seconds} onChange={setSeconds} max={59} label="Seconds" />
        </div>

        <div className="space-y-4">
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