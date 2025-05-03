import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/timerUtils';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type TimerPreset = 'custom';

interface Reminder {
  id: string;
  text: string;
  isActive: boolean;
  order: number;
  createdAt: number;
  completedAt?: number;
}

interface EmotionalRating {
  timestamp: number;
  rating: number;
}

interface TimerSettings {
  hours: number;
  minutes: number;
  seconds: number;
  isRecurring: boolean;
  selectedSound: string;
  soundRepeatCount: number;
  reminders: Reminder[];
  trackEmotionalReactivity: boolean;
  emotionalTrackingInterval: 'timer' | 'custom';
  customTrackingMinutes: number;
}

interface TimerSession {
  id: string;
  duration: number;
  completedAt?: Date;
  preset: TimerPreset;
}

interface TimerContextType {
  seconds: number;
  status: TimerStatus;
  preset: TimerPreset;
  timeDisplay: string;
  progress: number;
  sessions: TimerSession[];
  startTimer: (seconds: number, presetType?: TimerPreset, isRecurring?: boolean) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
  setCustomTime: (hours: number, minutes: number, seconds: number) => void;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  selectedSound: string;
  setSelectedSound: (sound: string) => void;
  soundRepeatCount: number;
  setSoundRepeatCount: (count: number) => void;
  availableSounds: string[];
  savedSettings: TimerSettings;
  saveSettings: (settings: TimerSettings) => void;
  reminders: Reminder[];
  addReminder: (text: string) => void;
  removeReminder: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  toggleReminderComplete: (id: string) => void;
  reorderReminders: (reminders: Reminder[]) => void;
  currentReminderIndex: number;
  showReminder: boolean;
  setShowReminder: (show: boolean) => void;
  handleReminderDismiss: () => void;
  trackEmotionalReactivity: boolean;
  setTrackEmotionalReactivity: (value: boolean) => void;
  emotionalTrackingInterval: 'timer' | 'custom';
  setEmotionalTrackingInterval: (interval: 'timer' | 'custom') => void;
  customTrackingMinutes: number;
  setCustomTrackingMinutes: (minutes: number) => void;
  showEmotionalTracker: boolean;
  setShowEmotionalTracker: (show: boolean) => void;
  emotionalRatings: EmotionalRating[];
  addEmotionalRating: (rating: number) => void;
}

const defaultSettings: TimerSettings = {
  hours: 0,
  minutes: 5,
  seconds: 0,
  isRecurring: false,
  selectedSound: '/Chimes.mp3',
  soundRepeatCount: 1,
  reminders: [],
  trackEmotionalReactivity: false,
  emotionalTrackingInterval: 'timer',
  customTrackingMinutes: 5
};

const TimerContext = createContext<TimerContextType>({
  seconds: 0,
  status: 'idle',
  preset: 'custom',
  timeDisplay: '00:00',
  progress: 0,
  sessions: [],
  startTimer: () => {},
  pauseTimer: () => {},
  resumeTimer: () => {},
  resetTimer: () => {},
  stopTimer: () => {},
  setCustomTime: () => {},
  isRecurring: false,
  setIsRecurring: () => {},
  selectedSound: '/Chimes.mp3',
  setSelectedSound: () => {},
  soundRepeatCount: 1,
  setSoundRepeatCount: () => {},
  availableSounds: ['/Chimes.mp3', '/Crystal.mp3', '/Deep Copper Bell.mp3', '/High Bell.mp3'],
  savedSettings: defaultSettings,
  saveSettings: () => {},
  reminders: [],
  addReminder: () => {},
  removeReminder: () => {},
  updateReminder: () => {},
  toggleReminderComplete: () => {},
  reorderReminders: () => {},
  currentReminderIndex: 0,
  showReminder: false,
  setShowReminder: () => {},
  handleReminderDismiss: () => {},
  trackEmotionalReactivity: false,
  setTrackEmotionalReactivity: () => {},
  emotionalTrackingInterval: 'timer',
  setEmotionalTrackingInterval: () => {},
  customTrackingMinutes: 5,
  setCustomTrackingMinutes: () => {},
  showEmotionalTracker: false,
  setShowEmotionalTracker: () => {},
  emotionalRatings: [],
  addEmotionalRating: () => {}
});

export const useTimer = () => useContext(TimerContext);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [preset, setPreset] = useState<TimerPreset>('custom');
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TimerSession | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);
  const [showEmotionalTracker, setShowEmotionalTracker] = useState(false);
  const [emotionalRatings, setEmotionalRatings] = useState<EmotionalRating[]>(() => {
    try {
      const savedRatings = localStorage.getItem('emotionalRatings');
      return savedRatings ? JSON.parse(savedRatings) : [];
    } catch (error) {
      console.error('Failed to parse saved emotional ratings:', error);
      return [];
    }
  });

  const [savedSettings, setSavedSettings] = useState<TimerSettings>(() => {
    try {
      const saved = localStorage.getItem('timerSettings');
      if (!saved) return defaultSettings;
      
      const parsedSettings = JSON.parse(saved);
      return {
        ...defaultSettings,
        ...parsedSettings,
        reminders: Array.isArray(parsedSettings.reminders) ? parsedSettings.reminders : []
      };
    } catch (error) {
      console.error('Failed to parse saved settings:', error);
      return defaultSettings;
    }
  });

  const [isRecurring, setIsRecurring] = useState(savedSettings.isRecurring);
  const [selectedSound, setSelectedSound] = useState(savedSettings.selectedSound);
  const [soundRepeatCount, setSoundRepeatCount] = useState(savedSettings.soundRepeatCount);
  const [reminders, setReminders] = useState<Reminder[]>(savedSettings.reminders);
  const [trackEmotionalReactivity, _setTrackEmotionalReactivity] = useState(savedSettings.trackEmotionalReactivity);
  const [emotionalTrackingInterval, _setEmotionalTrackingInterval] = useState<'timer' | 'custom'>(savedSettings.emotionalTrackingInterval);
  const [customTrackingMinutes, _setCustomTrackingMinutes] = useState(savedSettings.customTrackingMinutes);

  const availableSounds = ['/Chimes.mp3', '/Crystal.mp3', '/Deep Copper Bell.mp3', '/High Bell.mp3'];

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundPlayCountRef = useRef(0);
  const bellSequenceTimeoutRef = useRef<number | null>(null);
  const emotionalTrackingIntervalRef = useRef<number | null>(null);
  const emotionalTrackerPendingRef = useRef(false);

  const showNextReminder = () => {
    const activeReminders = reminders.filter(r => r.isActive && !r.completedAt)
      .sort((a, b) => a.order - b.order);
    
    if (activeReminders.length > 0) {
      setShowReminder(true);
      setCurrentReminderIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % activeReminders.length;
        return nextIndex;
      });
    }
  };

  const addReminder = (text: string) => {
    if (!text) return;
    if (text.length > 100) text = text.slice(0, 100);
    
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      text,
      isActive: true,
      order: reminders.length,
      createdAt: Date.now()
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    saveSettings({ ...savedSettings, reminders: updatedReminders });
  };

  const removeReminder = (id: string) => {
    const updatedReminders = reminders.filter(r => r.id !== id)
      .map((r, index) => ({ ...r, order: index }));
    setReminders(updatedReminders);
    saveSettings({ ...savedSettings, reminders: updatedReminders });
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    const updatedReminders = reminders.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    setReminders(updatedReminders);
    saveSettings({ ...savedSettings, reminders: updatedReminders });
  };

  const toggleReminderComplete = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    const updates = {
      completedAt: reminder.completedAt ? undefined : Date.now()
    };
    updateReminder(id, updates);
  };

  const reorderReminders = (newOrder: Reminder[]) => {
    const updatedReminders = newOrder.map((r, index) => ({ ...r, order: index }));
    setReminders(updatedReminders);
    saveSettings({ ...savedSettings, reminders: updatedReminders });
  };

  const addEmotionalRating = (rating: number) => {
    const newRating: EmotionalRating = {
      timestamp: Date.now(),
      rating
    };
    const updatedRatings = [...emotionalRatings, newRating];
    setEmotionalRatings(updatedRatings);
    setShowEmotionalTracker(false);
    
    // Save to localStorage
    try {
      localStorage.setItem('emotionalRatings', JSON.stringify(updatedRatings));
    } catch (error) {
      console.error('Failed to save emotional ratings:', error);
    }
  };

  const saveSettings = (settings: TimerSettings) => {
    try {
      const validatedSettings = {
        ...settings,
        reminders: Array.isArray(settings.reminders) ? settings.reminders : []
      };
      
      localStorage.setItem('timerSettings', JSON.stringify(validatedSettings));
      setSavedSettings(validatedSettings);
      setIsRecurring(validatedSettings.isRecurring);
      setSelectedSound(validatedSettings.selectedSound);
      setSoundRepeatCount(validatedSettings.soundRepeatCount);
      setReminders(validatedSettings.reminders);
      
      // Use the internal setters directly if needed
      if (settings.trackEmotionalReactivity !== undefined) {
        _setTrackEmotionalReactivity(settings.trackEmotionalReactivity);
      }
      if (settings.emotionalTrackingInterval !== undefined) {
        _setEmotionalTrackingInterval(settings.emotionalTrackingInterval);
      }
      if (settings.customTrackingMinutes !== undefined) {
        _setCustomTrackingMinutes(settings.customTrackingMinutes);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  useEffect(() => {
    // Initialize audio on mount
    const audio = new Audio(selectedSound);
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (bellSequenceTimeoutRef.current) {
        clearTimeout(bellSequenceTimeoutRef.current);
      }
      if (emotionalTrackingIntervalRef.current) {
        clearInterval(emotionalTrackingIntervalRef.current);
      }
    };
  }, [selectedSound]);

  useEffect(() => {
    if (status === 'running' && trackEmotionalReactivity && emotionalTrackingInterval === 'custom') {
      const intervalMs = customTrackingMinutes * 60 * 1000;
      emotionalTrackingIntervalRef.current = window.setInterval(() => {
        setShowEmotionalTracker(true);
      }, intervalMs);

      return () => {
        if (emotionalTrackingIntervalRef.current) {
          clearInterval(emotionalTrackingIntervalRef.current);
        }
      };
    }
  }, [status, trackEmotionalReactivity, emotionalTrackingInterval, customTrackingMinutes]);

  const playBellSequence = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(selectedSound);
    }
    
    soundPlayCountRef.current = 0;
    const playNextBell = () => {
      if (soundPlayCountRef.current < soundRepeatCount) {
        soundPlayCountRef.current++;
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
        
        if (soundPlayCountRef.current < soundRepeatCount) {
          bellSequenceTimeoutRef.current = window.setTimeout(playNextBell, 3500);
        } else {
          handleSequenceComplete();
        }
      }
    };

    playNextBell();
  };

  const handleSequenceComplete = () => {
    // Check if we have active reminders
    const activeReminders = reminders.filter(r => r.isActive && !r.completedAt)
      .sort((a, b) => a.order - b.order);
    
    const hasActiveReminders = activeReminders.length > 0;
    
    // Show reminder if we have active reminders
    if (hasActiveReminders) {
      setShowReminder(true);
      setCurrentReminderIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % activeReminders.length;
        return nextIndex;
      });
    }
    
    // Show emotional tracker if tracking is enabled and set to timer mode
    if (trackEmotionalReactivity && emotionalTrackingInterval === 'timer') {
      setShowEmotionalTracker(true);
      // No longer need the pending flag since both will show at once
      emotionalTrackerPendingRef.current = false;
    }
    
    // Handle timer reset for recurring timers
    if (isRecurring) {
      setSeconds(initialSeconds);
      setStatus('running');
      const newSession: TimerSession = {
        id: crypto.randomUUID(),
        duration: initialSeconds,
        preset: preset
      };
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setStatus('completed');
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (bellSequenceTimeoutRef.current) {
      clearTimeout(bellSequenceTimeoutRef.current);
    }
    soundPlayCountRef.current = 0;
  };

  const timeDisplay = formatTime(seconds);
  const progress = initialSeconds > 0 ? ((initialSeconds - seconds) / initialSeconds) * 100 : 0;

  useEffect(() => {
    if (status === 'running' && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                completedAt: new Date()
              };
              setSessions(prev => 
                prev.map(s => s.id === updatedSession.id ? updatedSession : s)
              );
            }
            playBellSequence();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, seconds, currentSession]);

  const startTimer = (time: number, presetType: TimerPreset = 'custom', recurring: boolean = false) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopSound();
    
    setSeconds(time);
    setInitialSeconds(time);
    setStatus('running');
    setPreset(presetType);
    setIsRecurring(recurring);
    setCurrentReminderIndex(0);
    setShowReminder(false);
    setShowEmotionalTracker(false);
    
    const newSession: TimerSession = {
      id: crypto.randomUUID(),
      duration: time,
      preset: presetType
    };
    
    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
  };

  const pauseTimer = () => {
    if (status === 'running') {
      setStatus('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (emotionalTrackingIntervalRef.current) {
        clearInterval(emotionalTrackingIntervalRef.current);
      }
    }
  };

  const resumeTimer = () => {
    if (status === 'paused') {
      setStatus('running');
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (emotionalTrackingIntervalRef.current) {
      clearInterval(emotionalTrackingIntervalRef.current);
    }
    stopSound();
    setSeconds(initialSeconds);
    setStatus('running');
    setCurrentReminderIndex(0);
    setShowReminder(false);
    setShowEmotionalTracker(false);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (emotionalTrackingIntervalRef.current) {
      clearInterval(emotionalTrackingIntervalRef.current);
    }
    stopSound();
    setStatus('idle');
    setSeconds(0);
    setInitialSeconds(0);
    setCurrentSession(null);
    setIsRecurring(false);
    setShowReminder(false);
    setShowEmotionalTracker(false);
    setCurrentReminderIndex(0);
  };

  const setCustomTime = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    setSeconds(totalSeconds);
    setInitialSeconds(totalSeconds);
  };

  const setTrackEmotionalReactivity = (value: boolean) => {
    _setTrackEmotionalReactivity(value);
    const updatedSettings = {
      ...savedSettings,
      trackEmotionalReactivity: value
    };
    setSavedSettings(updatedSettings);
    localStorage.setItem('timerSettings', JSON.stringify(updatedSettings));
  };

  const setEmotionalTrackingInterval = (interval: 'timer' | 'custom') => {
    _setEmotionalTrackingInterval(interval);
    const updatedSettings = {
      ...savedSettings,
      emotionalTrackingInterval: interval
    };
    setSavedSettings(updatedSettings);
    localStorage.setItem('timerSettings', JSON.stringify(updatedSettings));
  };

  const setCustomTrackingMinutes = (minutes: number) => {
    const validMinutes = Math.max(1, Math.min(60, minutes || 1));
    _setCustomTrackingMinutes(validMinutes);
    const updatedSettings = {
      ...savedSettings,
      customTrackingMinutes: validMinutes
    };
    setSavedSettings(updatedSettings);
    localStorage.setItem('timerSettings', JSON.stringify(updatedSettings));
  };

  // Update the handler for when reminder is dismissed
  const handleReminderDismiss = () => {
    setShowReminder(false);
    // Also close emotional tracker if it's showing
    setShowEmotionalTracker(false);
  };

  return (
    <TimerContext.Provider
      value={{
        seconds,
        status,
        preset,
        timeDisplay,
        progress,
        sessions,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        stopTimer,
        setCustomTime,
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
        reorderReminders,
        currentReminderIndex,
        showReminder,
        setShowReminder,
        handleReminderDismiss,
        trackEmotionalReactivity,
        setTrackEmotionalReactivity,
        emotionalTrackingInterval,
        setEmotionalTrackingInterval,
        customTrackingMinutes,
        setCustomTrackingMinutes,
        showEmotionalTracker,
        setShowEmotionalTracker,
        emotionalRatings,
        addEmotionalRating
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};