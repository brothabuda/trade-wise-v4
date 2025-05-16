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

  describe('Recurring Timer with Multiple Rings', () => {
    it('TC011: Timer should not reset during bell sequence and only restart after all bells for recurring timer', async () => {
      const TestComponent = () => {
        // initialSeconds is internal to the provider, so we don't access it directly here.
        // We verify its effect by checking the 'seconds' value after start and after recurrence.
        const { seconds, status, soundRepeatCount, sessions, startTimer, selectedSound } = useTimer();
        return (
          <div>
            <div data-testid="seconds">{seconds}</div>
            <div data-testid="status">{status}</div>
            <div data-testid="sound-repeat-count">{soundRepeatCount}</div>
            <div data-testid="sessions-count">{sessions.length}</div>
            <button onClick={() => startTimer(3, 'custom', true)}>Start 3s Timer</button>
            <div>Selected Sound: {selectedSound}</div>
          </div>
        );
      };

      // Mock settings that would be loaded by TimerProvider
      // TimerProvider will set its internal initialSeconds based on these hours/minutes/seconds.
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        hours: 0,
        minutes: 0,
        seconds: 3, // This will become the initialSeconds value internally for the startTimer call later
        isRecurring: true,
        selectedSound: '/Chimes.mp3',
        soundRepeatCount: 3, 
      }));

      render(
        <ThemeProvider>
          <TimerProvider>
            <TestComponent />
          </TimerProvider>
        </ThemeProvider>
      );

      // The soundRepeatCount from localStorage should be reflected in the context.
      // We can read it from the TestComponent to confirm, though it's not strictly part of this test's main assertion.
      // expect(screen.getByTestId('sound-repeat-count').textContent).toBe('3');

      // Start the timer with a duration of 3 seconds. This will also set initialSeconds to 3 within the provider.
      fireEvent.click(screen.getByText('Start 3s Timer'));
      
      expect(screen.getByTestId('seconds').textContent).toBe('3');
      expect(screen.getByTestId('status').textContent).toBe('running');
      expect(screen.getByTestId('sessions-count').textContent).toBe('1'); // First session created

      // Advance time to complete the first countdown (3 seconds)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Timer should be at 0, playBellSequence begins, first bell rings
      expect(screen.getByTestId('seconds').textContent).toBe('0');
      expect(mockAudio.play).toHaveBeenCalledTimes(1);

      // Advance time for the first bell duration (e.g., 1 second, less than bell interval of 3.5s)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // CRITICAL CHECK: Timer should STILL be 0, not reset to initialSeconds (3)
      expect(screen.getByTestId('seconds').textContent).toBe('0');
      expect(mockAudio.play).toHaveBeenCalledTimes(1); // Second bell hasn't rung yet

      // Advance time for the second bell to ring (another 2.5s for total 3.5s interval)
      act(() => {
        vi.advanceTimersByTime(2500); 
      });
      expect(mockAudio.play).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('seconds').textContent).toBe('0'); // Still 0

      // Advance time for the third bell to ring (another 3.5s interval)
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      expect(mockAudio.play).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId('seconds').textContent).toBe('0'); // Still 0 before handleSequenceComplete fully resets

      // After the last bell, handleSequenceComplete runs and resets the timer for recurrence
      // Need to allow microtasks for state updates from handleSequenceComplete to propagate
      act(() => {
        vi.runOnlyPendingTimers(); // Ensure any remaining timeouts in bell sequence are done
      });
      
      // Now the timer should have been reset to initialSeconds (3) for the new cycle
      expect(screen.getByTestId('seconds').textContent).toBe('3');
      expect(screen.getByTestId('status').textContent).toBe('running');
      // A new session is created when the timer restarts via handleSequenceComplete for recurrence.
      // The original session was created by startTimer. So, 1 (original) + 1 (restarted) = 2.
      expect(screen.getByTestId('sessions-count').textContent).toBe('2'); 
    });
  });

  describe('Bell Sequence and Reminder Interaction', () => {
    it('TC012: playBellSequence should show reminder at the start of the sequence if active reminders exist', async () => {
      const TestComponent = () => {
        const { seconds, showReminder, currentReminderIndex, reminders, addReminder, startTimer } = useTimer();
        return (
          <div>
            <div data-testid="seconds">{seconds}</div>
            <div data-testid="showReminder">{showReminder.toString()}</div>
            <div data-testid="currentReminderIndex">{currentReminderIndex}</div>
            <div data-testid="reminders-count">{reminders.length}</div>
            <button onClick={() => addReminder('Test Reminder 1')}>Add Reminder</button>
            <button onClick={() => startTimer(1, 'custom', true)}>Start 1s Timer</button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TimerProvider>
            <TestComponent />
          </TimerProvider>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Add Reminder'));
      expect(screen.getByTestId('reminders-count').textContent).toBe('1');
      expect(screen.getByTestId('showReminder').textContent).toBe('false');

      fireEvent.click(screen.getByText('Start 1s Timer'));
      expect(screen.getByTestId('currentReminderIndex').textContent).toBe('0'); // Reset by startTimer

      // Advance time to complete the countdown (1 second)
      // playBellSequence is called, which should immediately set showReminder to true
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('seconds').textContent).toBe('0');
      expect(mockAudio.play).toHaveBeenCalledTimes(1); // First bell
      expect(screen.getByTestId('showReminder').textContent).toBe('true');
      expect(screen.getByTestId('currentReminderIndex').textContent).toBe('0'); // Reminder for index 0 shown
    });

    it('TC013: stopTimer should interrupt playBellSequence and stop sounds', async () => {
      const TestComponent = () => {
        const { seconds, status, startTimer, stopTimer } = useTimer();
        return (
          <div>
            <div data-testid="seconds">{seconds}</div>
            <div data-testid="status">{status}</div>
            <button onClick={() => startTimer(2, 'custom', true)}>Start 2s Timer</button>
            <button onClick={() => stopTimer()}>Stop Timer</button>
          </div>
        );
      };

      // Ensure soundRepeatCount is > 1 for this test
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        hours: 0, minutes: 0, seconds: 2, isRecurring: true,
        selectedSound: '/Chimes.mp3', soundRepeatCount: 3,
      }));

      render(
        <ThemeProvider>
          <TimerProvider>
            <TestComponent />
          </TimerProvider>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Start 2s Timer'));

      // Advance time to complete countdown (2s) and play first bell
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('seconds').textContent).toBe('0');
      expect(screen.getByTestId('status').textContent).toBe('running'); // Status is running as bells are playing

      // Advance a bit more, into the interval before the second bell (e.g., 1s into 3.5s interval)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockAudio.play).toHaveBeenCalledTimes(1); // Still only 1st bell played

      // Now, stop the timer
      fireEvent.click(screen.getByText('Stop Timer'));

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(screen.getByTestId('status').textContent).toBe('idle');
      expect(screen.getByTestId('seconds').textContent).toBe('0');

      // Ensure subsequent bells do not play by advancing time past where they would have occurred
      const playCallsBefore = mockAudio.play.mock.calls.length;
      act(() => {
        vi.advanceTimersByTime(7000); // Enough time for 2 more bells (3.5s each)
      });
      expect(mockAudio.play.mock.calls.length).toBe(playCallsBefore); // No new play calls
    });

    it('TC016: resetTimer should interrupt playBellSequence, stop sounds, and reset timer state', async () => {
      const TestComponent = () => {
        // initialSeconds is internal. We capture initial seconds value from the display.
        const { seconds, status, startTimer, resetTimer, currentReminderIndex, showReminder } = useTimer();
        return (
          <div>
            <div data-testid="seconds">{seconds}</div>
            <div data-testid="status">{status}</div>
            <div data-testid="currentReminderIndex">{currentReminderIndex}</div>
            <div data-testid="showReminder">{showReminder.toString()}</div>
            <button onClick={() => startTimer(5, 'custom', true)}>Start 5s Timer</button>
            <button onClick={() => resetTimer()}>Reset Timer</button>
          </div>
        );
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        hours: 0, minutes: 0, seconds: 5, isRecurring: true,
        selectedSound: '/Chimes.mp3', soundRepeatCount: 3,
      }));

      render(
        <ThemeProvider>
          <TimerProvider>
            <TestComponent />
          </TimerProvider>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Start 5s Timer'));
      const initialDurationText = screen.getByTestId('seconds').textContent; // Should be "5"

      // Advance time to complete countdown (5s) and play first bell
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('seconds').textContent).toBe('0');
      expect(screen.getByTestId('status').textContent).toBe('running'); // Bells playing

      // Advance a bit more, into the interval before the second bell
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(mockAudio.play).toHaveBeenCalledTimes(1);

      // Now, reset the timer
      fireEvent.click(screen.getByText('Reset Timer'));

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(screen.getByTestId('status').textContent).toBe('running'); // Reset goes back to running
      expect(screen.getByTestId('seconds').textContent).toBe(initialDurationText); // Resets to initial duration (5s)
      expect(screen.getByTestId('currentReminderIndex').textContent).toBe('0'); // Reset should also reset reminder index
      expect(screen.getByTestId('showReminder').textContent).toBe('false'); // And hide reminder popup

      // Ensure subsequent bells do not play
      const playCallsBeforeReset = mockAudio.play.mock.calls.length;
      act(() => {
        vi.advanceTimersByTime(7000); 
      });
      expect(mockAudio.play.mock.calls.length).toBe(playCallsBeforeReset);
    });
  });

  describe('Timer Countdown and Completion', () => {
    it('TC014: Timer should count down second by second and mark session completed', async () => {
      const TestComponent = () => {
        const { seconds, status, sessions, startTimer } = useTimer();
        return (
          <div>
            <div data-testid="seconds">{seconds}</div>
            <div data-testid="status">{status}</div>
            <div data-testid="sessions-count">{sessions.length}</div>
            {/* For checking completedAt, we might need to inspect sessions array directly if not exposed */}
            <button onClick={() => startTimer(3, 'custom', false)}>Start 3s Timer (No Repeat)</button>
          </div>
        );
      };

      render(
        <ThemeProvider>
          <TimerProvider>
            <TestComponent />
          </TimerProvider>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Start 3s Timer (No Repeat)'));
      expect(screen.getByTestId('seconds').textContent).toBe('3');
      expect(screen.getByTestId('status').textContent).toBe('running');
      const initialSessionsCount = parseInt(screen.getByTestId('sessions-count').textContent || '0');

      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByTestId('seconds').textContent).toBe('2');

      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByTestId('seconds').textContent).toBe('1');

      // This will advance to 0, call playBellSequence, then handleSequenceComplete.
      // Since isRecurring is false, handleSequenceComplete will not restart the timer.
      // We need a way to check sessions[0].completedAt
      // For now, we check if play was called (meaning timer reached 0)
      act(() => { vi.advanceTimersByTime(1000); });
      expect(screen.getByTestId('seconds').textContent).toBe('0');
      expect(mockAudio.play).toHaveBeenCalled(); 
      
      // After handleSequenceComplete runs (due to bell finishing)
      act(() => { vi.runOnlyPendingTimers(); }); // Ensure bell sequence timeout is processed
      
      // For a non-recurring timer, status should be 'completed' and seconds 0.
      expect(screen.getByTestId('status').textContent).toBe('completed');
      expect(screen.getByTestId('seconds').textContent).toBe('0');
      
      // Verify the session was marked as completed
      // This needs access to the sessions array. Test TC015 covers this more directly.
      // We can add a check here if TestComponent exposes sessions for detailed inspection.
    });

    it('TC015: handleSequenceComplete should create a new session for recurring timers', async () => {
      let capturedSessions: any[] = [];
      const TestComponent = () => {
        const { sessions, startTimer } = useTimer();
        capturedSessions = sessions; // Capture sessions for inspection
        return (
          <div>
            <div data-testid="sessions-count">{sessions.length}</div>
            <button onClick={() => startTimer(1, 'custom', true)}>Start 1s Recurring Timer</button>
          </div>
        );
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        hours: 0, minutes: 0, seconds: 1, isRecurring: true, // ensure isRecurring
        selectedSound: '/Chimes.mp3', soundRepeatCount: 1,
      }));      

      render(
        <ThemeProvider>
          <TimerProvider>
            <TestComponent />
          </TimerProvider>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText('Start 1s Recurring Timer'));
      expect(screen.getByTestId('sessions-count').textContent).toBe('1');
      const firstSessionId = capturedSessions[0]?.id;

      // Complete the timer and bell sequence
      act(() => {
        vi.advanceTimersByTime(1000); // Countdown
        vi.runOnlyPendingTimers();    // Bell sequence and handleSequenceComplete
      });
      
      expect(screen.getByTestId('sessions-count').textContent).toBe('2');
      expect(capturedSessions.length).toBe(2);
      expect(capturedSessions[0].id).toBe(firstSessionId);
      expect(capturedSessions[0].completedAt).toBeInstanceOf(Date); // First session is completed
      expect(capturedSessions[1].id).not.toBe(firstSessionId);      // New session has a new ID
      expect(capturedSessions[1].completedAt).toBeUndefined();      // New session is not yet completed
    });
  });
});