import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerProvider, useTimer } from '../context/TimerContext';
import { ThemeProvider } from '../context/ThemeContext';
import TimerDashboard from '../components/TimerDashboard';

// Mock Audio API
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
};
global.Audio = vi.fn().mockImplementation(() => mockAudio);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Helper function to render timer with providers
const renderTimer = () => {
  return render(
    <ThemeProvider>
      <TimerProvider>
        <TimerDashboard />
      </TimerProvider>
    </ThemeProvider>
  );
};

describe('Timer Functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLocalStorage.getItem.mockReset();
    mockLocalStorage.setItem.mockReset();
    mockAudio.play.mockClear();
    mockAudio.pause.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic Timer Operations', () => {
    it('TC001: Should start timer with valid duration', async () => {
      renderTimer();
      
      // Set 5 minutes
      const minutesSelect = screen.getByLabelText('Minutes');
      await userEvent.selectOptions(minutesSelect, '05');
      
      // Start timer
      const startButton = screen.getByText('Start Timer');
      await userEvent.click(startButton);
      
      // Verify timer is running
      expect(screen.getByText('05:00')).toBeInTheDocument();
      
      // Advance timer by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Verify time decreased
      expect(screen.getByText('04:59')).toBeInTheDocument();
    });

    it('TC002: Should pause and resume timer correctly', async () => {
      renderTimer();
      
      // Set and start 5 minute timer
      const minutesSelect = screen.getByLabelText('Minutes');
      await userEvent.selectOptions(minutesSelect, '05');
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Advance timer and pause
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      await userEvent.click(screen.getByText('Pause'));
      
      const timeBeforePause = screen.getByText('04:58');
      
      // Advance timer while paused
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      // Verify time didn't change during pause
      expect(timeBeforePause).toBeInTheDocument();
      
      // Resume timer
      await userEvent.click(screen.getByText('Resume'));
      
      // Advance timer after resume
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Verify timer continues from paused time
      expect(screen.getByText('04:57')).toBeInTheDocument();
    });

    it('TC003: Should reset timer to initial state', async () => {
      renderTimer();
      
      // Set and start 5 minute timer
      const minutesSelect = screen.getByLabelText('Minutes');
      await userEvent.selectOptions(minutesSelect, '05');
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Advance timer
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      // Reset timer
      await userEvent.click(screen.getByText('Reset'));
      
      // Verify timer returns to initial state
      expect(screen.getByLabelText('Minutes')).toBeInTheDocument();
      expect(screen.getByText('Start Timer')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('TC004: Should not start timer with zero duration', async () => {
      renderTimer();
      
      const startButton = screen.getByText('Start Timer');
      expect(startButton).toBeDisabled();
    });

    it('TC005: Should handle maximum duration correctly', async () => {
      renderTimer();
      
      // Set maximum values
      const hoursSelect = screen.getByLabelText('Hours');
      const minutesSelect = screen.getByLabelText('Minutes');
      const secondsSelect = screen.getByLabelText('Seconds');
      
      await userEvent.selectOptions(hoursSelect, '23');
      await userEvent.selectOptions(minutesSelect, '59');
      await userEvent.selectOptions(secondsSelect, '59');
      
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Verify timer started with maximum duration
      expect(screen.getByText('23:59:59')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('TC006: Should persist timer settings', async () => {
      // Set initial localStorage value
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        hours: 0,
        minutes: 10,
        seconds: 0,
        isRecurring: false,
        selectedSound: '/Chimes.mp3',
        soundRepeatCount: 1
      }));
      
      renderTimer();
      
      // Verify settings were restored
      const minutesSelect = screen.getByLabelText('Minutes');
      expect(minutesSelect).toHaveValue('10');
    });

    it('TC007: Should maintain state during timer operation', async () => {
      renderTimer();
      
      // Set and start 5 minute timer
      const minutesSelect = screen.getByLabelText('Minutes');
      await userEvent.selectOptions(minutesSelect, '05');
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Verify localStorage is updated
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Verify timer state is maintained
      expect(screen.getByText('05:00')).toBeInTheDocument();
    });
  });

  describe('Sound Functionality', () => {
    it('TC008: Should play sound on timer completion', async () => {
      renderTimer();
      
      // Set and start 1 second timer
      const secondsSelect = screen.getByLabelText('Seconds');
      await userEvent.selectOptions(secondsSelect, '01');
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Complete timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Verify sound played
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it('TC009: Should respect sound repeat count', async () => {
      renderTimer();
      
      // Set 2 repeats
      const repeatSelect = screen.getByLabelText('Number of Rings');
      await userEvent.selectOptions(repeatSelect, '2');
      
      // Set and start 1 second timer
      const secondsSelect = screen.getByLabelText('Seconds');
      await userEvent.selectOptions(secondsSelect, '01');
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Complete timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Advance through both rings
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      
      // Verify sound played twice
      expect(mockAudio.play).toHaveBeenCalledTimes(2);
    });
  });

  describe('Recurring Timer', () => {
    it('TC010: Should restart timer when recurring is enabled', async () => {
      renderTimer();
      
      // Enable recurring
      const recurringCheckbox = screen.getByLabelText(/Repeat timer/);
      await userEvent.click(recurringCheckbox);
      
      // Set and start 1 second timer
      const secondsSelect = screen.getByLabelText('Seconds');
      await userEvent.selectOptions(secondsSelect, '01');
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Complete first cycle
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Wait for sound sequence
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      
      // Verify timer restarted
      expect(screen.getByText('00:01')).toBeInTheDocument();
    });
  });
});