import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/timerUtils';
import { TimerStatus, TimerPreset } from '../types/timerTypes';

export interface BankedReminder {
  id: string;
  text: string;
}

export interface Reminder {
  id: string;
  text: string;
  isActive: boolean;
  order: number;
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
  activeReminderIds: string[];
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
  reorderReminders: (orderedActiveIds: string[]) => void;
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
  reminderBank: BankedReminder[];
  activeReminderIds: string[];
  addReminderToBank: (text: string) => string | undefined;
  updateReminderInBank: (id: string, newText: string) => void;
  deleteReminderFromBank: (id: string) => void;
  toggleReminderActive: (reminderId: string) => void;
}

const defaultSettings: TimerSettings = {
  hours: 0,
  minutes: 5,
  seconds: 0,
  isRecurring: true,
  selectedSound: '/Chimes.mp3',
  soundRepeatCount: 1,
  activeReminderIds: [],
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
  addEmotionalRating: () => {},
  reminderBank: [],
  activeReminderIds: [],
  addReminderToBank: () => undefined,
  updateReminderInBank: () => {},
  deleteReminderFromBank: () => {},
  toggleReminderActive: () => {},
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
        activeReminderIds: Array.isArray(parsedSettings.activeReminderIds) ? parsedSettings.activeReminderIds : [],
      };
    } catch (error) {
      console.error('Failed to parse saved settings:', error);
      return defaultSettings;
    }
  });

  const [isRecurring, setIsRecurring] = useState(savedSettings.isRecurring);
  const [selectedSound, setSelectedSound] = useState(savedSettings.selectedSound);
  const [soundRepeatCount, setSoundRepeatCount] = useState(savedSettings.soundRepeatCount);
  const [activeReminderIdsState, setActiveReminderIdsState] = useState<string[]>(savedSettings.activeReminderIds);
  const [trackEmotionalReactivity, _setTrackEmotionalReactivity] = useState(savedSettings.trackEmotionalReactivity);
  const [emotionalTrackingInterval, _setEmotionalTrackingInterval] = useState<'timer' | 'custom'>(savedSettings.emotionalTrackingInterval);
  const [customTrackingMinutes, _setCustomTrackingMinutes] = useState(savedSettings.customTrackingMinutes);

  const [reminderBank, setReminderBank] = useState<BankedReminder[]>(() => {
    try {
      const savedBank = localStorage.getItem('reminderBank');
      return savedBank ? JSON.parse(savedBank) : [];
    } catch (error) {
      console.error('Failed to parse reminder bank:', error);
      return [];
    }
  });

  const [activeSessionReminders, setActiveSessionReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const newActiveSessionReminders: Reminder[] = [];
    activeReminderIdsState.forEach((id, index) => {
      const bankedReminder = reminderBank.find(br => br.id === id);
      if (bankedReminder) {
        newActiveSessionReminders.push({
          id: bankedReminder.id,
          text: bankedReminder.text,
          isActive: true, 
          order: index,   
          completedAt: undefined 
        });
      }
    });
    setActiveSessionReminders(newActiveSessionReminders);
    setCurrentReminderIndex(0); // Reset index when active reminders change
  }, [reminderBank, activeReminderIdsState]);

  // Temporary placeholder for the derived reminders. This will be replaced.
  // const reminders: Reminder[] = []; // REMOVE THIS PLACEHOLDER

  const availableSounds = ['/Chimes.mp3', '/Crystal.mp3', '/Deep Copper Bell.mp3', '/High Bell.mp3'];

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundPlayCountRef = useRef(0);
  const bellSequenceTimeoutRef = useRef<number | null>(null);
  const emotionalTrackingIntervalRef = useRef<number | null>(null);

  const advanceReminderIndex = () => {
    const availableReminders = activeSessionReminders
      .filter(r => r.isActive && !r.completedAt)
      .sort((a, b) => a.order - b.order);

    if (availableReminders.length === 0) {
      setCurrentReminderIndex(0); // Or handle no available reminders scenario
      return;
    }

    const currentGlobalReminder = activeSessionReminders[currentReminderIndex];
    let nextIndexInAvailableList = 0;

    if (currentGlobalReminder && !currentGlobalReminder.completedAt && currentGlobalReminder.isActive) {
      const currentIndexInAvailableList = availableReminders.findIndex(r => r.id === currentGlobalReminder.id);
      if (currentIndexInAvailableList !== -1) {
        nextIndexInAvailableList = (currentIndexInAvailableList + 1) % availableReminders.length;
      } else {
        // Current reminder (by index) is not in the available list (e.g. became inactive/completed by other means not reflected immediately in index)
        // Default to the first available reminder
        nextIndexInAvailableList = 0;
      }
    } else {
      // No current valid reminder (e.g. index points to completed/inactive, or initial state)
      // Default to the first available reminder
      nextIndexInAvailableList = 0;
    }
    
    const nextReminderInAvailableList = availableReminders[nextIndexInAvailableList];
    if (nextReminderInAvailableList) {
      const nextGlobalIndex = activeSessionReminders.findIndex(r => r.id === nextReminderInAvailableList.id);
      setCurrentReminderIndex(nextGlobalIndex >= 0 ? nextGlobalIndex : 0);
    } else {
      // Should not happen if availableReminders.length > 0
      setCurrentReminderIndex(0);
    }
  };

  const addReminder = (text: string) => {
    if (!text) return;
    if (text.length > 100) text = text.slice(0, 100);
    
    console.log('addReminder needs to be updated for reminder bank', text);
  };

  const removeReminder = (id: string) => {
    console.log('removeReminder needs to be updated for reminder bank', id);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    console.log('updateReminder needs to be updated for reminder bank', id, updates);
  };

  const toggleReminderComplete = (id: string) => {
    setActiveSessionReminders(prevReminders =>
      prevReminders.map(r =>
        r.id === id
          ? { ...r, completedAt: r.completedAt ? undefined : Date.now() }
          : r
      )
    );
  };

  const reorderReminders = (orderedActiveIds: string[]) => {
    setActiveReminderIdsState(orderedActiveIds);
    saveSettings({ ...savedSettings, activeReminderIds: orderedActiveIds });
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
        ...defaultSettings,
        ...settings,
        activeReminderIds: Array.isArray(settings.activeReminderIds) ? settings.activeReminderIds : [],
      };
      
      localStorage.setItem('timerSettings', JSON.stringify(validatedSettings));
      setSavedSettings(validatedSettings);
      setIsRecurring(validatedSettings.isRecurring);
      setSelectedSound(validatedSettings.selectedSound);
      setSoundRepeatCount(validatedSettings.soundRepeatCount);
      setActiveReminderIdsState(validatedSettings.activeReminderIds);
      
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

  const saveReminderBank = (bank: BankedReminder[]) => {
    try {
      localStorage.setItem('reminderBank', JSON.stringify(bank));
    } catch (error) {
      console.error('Failed to save reminder bank:', error);
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
    const activeSystemReminders = activeSessionReminders.filter(r => r.isActive && !r.completedAt);
    let reminderWasSetToShow = false;

    if (activeSystemReminders.length > 0) {
      setShowReminder(true);
      reminderWasSetToShow = true;
    }
    
    // Show emotional tracker ONLY IF no reminder was just displayed as part of this sequence start.
    if (trackEmotionalReactivity && emotionalTrackingInterval === 'timer' && !reminderWasSetToShow) {
      setShowEmotionalTracker(true);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(selectedSound);
    }
    
    soundPlayCountRef.current = 0;
    const playNextBell = () => {
      if (soundPlayCountRef.current < soundRepeatCount) {
        soundPlayCountRef.current++;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(err => {
            console.error(`Audio play failed (count ${soundPlayCountRef.current}):`, err);
          });
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
    // Reminder display is handled by playBellSequence.
    // Emotional Tracker display is handled by playBellSequence (if no reminder) or handleReminderDismiss (if reminder was shown).
    // This function now primarily focuses on timer recurrence.
    
    // Timer Recurrence Logic
    if (isRecurring) {
      console.log('Sequence complete, recurring: resetting timer with:', initialSeconds);
      setSeconds(initialSeconds);
      setStatus('running');
      const newSession: TimerSession = {
        id: crypto.randomUUID(),
        duration: initialSeconds,
        preset: preset // preset from the original timer start
      };
      setCurrentSession(newSession);
      setSessions(prev => [...prev, newSession]);
    } else {
      console.log('Sequence complete, not recurring: stopping timer.');
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
      console.log('Setting up timer interval, seconds:', seconds);
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                completedAt: new Date()
              };
              setSessions(prevSessions => 
                prevSessions.map(s => s.id === updatedSession.id ? updatedSession : s)
              );
            }
            console.log('Timer completed, playing bell sequence');
            playBellSequence();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } 
    // REMOVED THE else if (status === 'running' && seconds === 0) block that was causing premature timer resets.
    // The timer is now correctly reset only by handleSequenceComplete after all bells.
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, seconds, currentSession, initialSeconds]);

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
    setShowReminder(false);
    setShowEmotionalTracker(false);

    setActiveSessionReminders(prevReminders =>
      prevReminders.map(r => ({ ...r, completedAt: undefined }))
    );
    setCurrentReminderIndex(0); // Explicitly reset index here too for fresh start
    
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
    setShowReminder(false);
    setShowEmotionalTracker(false);

    setActiveSessionReminders(prevReminders =>
      prevReminders.map(r => ({ ...r, completedAt: undefined }))
    );
    setCurrentReminderIndex(0); // Explicitly reset index here too for fresh start
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
    setShowReminder(false);
    setShowEmotionalTracker(false);
    setCurrentReminderIndex(0);

    setActiveSessionReminders(prevReminders =>
      prevReminders.map(r => ({ ...r, completedAt: undefined }))
    );
    setCurrentReminderIndex(0); // Explicitly reset index here too for fresh start
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
    
    // If emotional tracking per timer is on, and we just dismissed a reminder, show the tracker now.
    if (trackEmotionalReactivity && emotionalTrackingInterval === 'timer') {
      setShowEmotionalTracker(true);
    }
    
    advanceReminderIndex();
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
        reminders: activeSessionReminders,
        addReminder: () => console.warn('addReminder on context is deprecated, use addReminderToBank'),
        removeReminder: () => console.warn('removeReminder on context is deprecated, use deleteReminderFromBank'),
        updateReminder: () => console.warn('updateReminder on context is deprecated, use updateReminderInBank'),
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
        addEmotionalRating,
        reminderBank,
        activeReminderIds: activeReminderIdsState,
        addReminderToBank: (text: string) => {
          if (!text.trim()) return undefined;
          const newBankedReminder: BankedReminder = {
            id: crypto.randomUUID(),
            text: text.trim(),
          };
          const updatedBank = [...reminderBank, newBankedReminder];
          setReminderBank(updatedBank);
          saveReminderBank(updatedBank);
          return newBankedReminder.id;
        },
        updateReminderInBank: (id: string, newText: string) => {
          if (!newText.trim()) return;
          const updatedBank = reminderBank.map(r => 
            r.id === id ? { ...r, text: newText.trim() } : r
          );
          setReminderBank(updatedBank);
          saveReminderBank(updatedBank);
        },
        deleteReminderFromBank: (id: string) => {
          const updatedBank = reminderBank.filter(r => r.id !== id);
          setReminderBank(updatedBank);
          saveReminderBank(updatedBank);
          // Also remove from activeReminderIds if it was there
          const updatedActiveIds = activeReminderIdsState.filter(activeId => activeId !== id);
          setActiveReminderIdsState(updatedActiveIds);
          saveSettings({ ...savedSettings, activeReminderIds: updatedActiveIds });
        },
        toggleReminderActive: (reminderId: string) => {
          const updatedActiveIds = activeReminderIdsState.includes(reminderId)
            ? activeReminderIdsState.filter(id => id !== reminderId)
            : [...activeReminderIdsState, reminderId];
          setActiveReminderIdsState(updatedActiveIds);
          saveSettings({ ...savedSettings, activeReminderIds: updatedActiveIds });
        },
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};