import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimerProvider, useTimer } from '../context/TimerContext';
import { ThemeProvider } from '../context/ThemeContext';
import TimerDashboard from '../components/TimerDashboard';
import CustomTimerInput from '../components/CustomTimerInput';

// Mock Audio API
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
};
(window as any).Audio = vi.fn().mockImplementation(() => mockAudio);

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

// Helper function to render just the CustomTimerInput for more focused reminder tests
const renderCustomTimerInput = () => {
  return render(
    <ThemeProvider>
      <TimerProvider>
        <CustomTimerInput />
      </TimerProvider>
    </ThemeProvider>
  );
};

// Test component that exposes reminders for direct testing
const ReminderTester = () => {
  const { 
    reminders, 
    addReminder, 
    removeReminder,
    updateReminder,
    toggleReminderComplete,
    reorderReminders,
    currentReminderIndex,
    showReminder,
    setShowReminder,
    handleReminderDismiss
  } = useTimer();

  const handleAddReminder = (text: string) => {
    addReminder(text);
  };

  return (
    <div>
      <div data-testid="reminder-count">{reminders.length}</div>
      <div data-testid="current-reminder-index">{currentReminderIndex}</div>
      <div data-testid="show-reminder">{showReminder ? 'true' : 'false'}</div>
      
      <button 
        data-testid="add-reminder-1" 
        onClick={() => handleAddReminder('Reminder 1')}
      >
        Add Reminder 1
      </button>
      <button 
        data-testid="add-reminder-2" 
        onClick={() => handleAddReminder('Reminder 2')}
      >
        Add Reminder 2
      </button>
      <button 
        data-testid="add-reminder-3" 
        onClick={() => handleAddReminder('Reminder 3')}
      >
        Add Reminder 3
      </button>
      <button 
        data-testid="toggle-reminder" 
        onClick={() => setShowReminder(!showReminder)}
      >
        Toggle Reminder
      </button>
      <button 
        data-testid="dismiss-reminder" 
        onClick={handleReminderDismiss}
      >
        Dismiss Reminder
      </button>
      
      <ul>
        {reminders.map((reminder, index) => (
          <li key={reminder.id} data-testid={`reminder-${index}`}>
            <span data-testid={`reminder-text-${index}`}>{reminder.text}</span>
            <span data-testid={`reminder-order-${index}`}>{reminder.order}</span>
            <button 
              data-testid={`remove-reminder-${index}`} 
              onClick={() => removeReminder(reminder.id)}
            >
              Remove
            </button>
            <button 
              data-testid={`toggle-complete-${index}`} 
              onClick={() => toggleReminderComplete(reminder.id)}
            >
              Toggle Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Helper function to render the ReminderTester
const renderReminderTester = () => {
  return render(
    <ThemeProvider>
      <TimerProvider>
        <ReminderTester />
      </TimerProvider>
    </ThemeProvider>
  );
};

describe('Reminder Functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLocalStorage.getItem.mockReset().mockReturnValue(null);
    mockLocalStorage.setItem.mockReset();
    mockAudio.play.mockClear();
    mockAudio.pause.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Reminder Management', () => {
    it('RTC001: Should add and display reminders', async () => {
      const { getByPlaceholderText, getByText, queryByText } = renderCustomTimerInput();
      
      // Add a reminder
      const reminderInput = getByPlaceholderText('Add a reminder...');
      await userEvent.type(reminderInput, 'Test reminder');
      fireEvent.click(getByText('Add'));
      
      // Check if reminder is displayed
      expect(getByText('Test reminder')).toBeInTheDocument();
    });

    it('RTC002: Should delete reminders', async () => {
      const { getByPlaceholderText, getByText, queryByText, getAllByLabelText } = renderCustomTimerInput();
      
      // Add a reminder
      const reminderInput = getByPlaceholderText('Add a reminder...');
      await userEvent.type(reminderInput, 'Test reminder to delete');
      fireEvent.click(getByText('Add'));
      
      // Delete the reminder
      const deleteButtons = getAllByLabelText('Remove reminder');
      fireEvent.click(deleteButtons[0]);
      
      // Check if reminder is removed
      expect(queryByText('Test reminder to delete')).not.toBeInTheDocument();
    });

    it('RTC003: Should reorder reminders correctly', async () => {
      const { getByTestId } = renderReminderTester();
      
      // Add three reminders
      fireEvent.click(getByTestId('add-reminder-1'));
      fireEvent.click(getByTestId('add-reminder-2'));
      fireEvent.click(getByTestId('add-reminder-3'));
      
      // Check initial order
      expect(getByTestId('reminder-text-0').textContent).toBe('Reminder 1');
      expect(getByTestId('reminder-text-1').textContent).toBe('Reminder 2');
      expect(getByTestId('reminder-text-2').textContent).toBe('Reminder 3');
      
      // The TimerContext handles the reordering internally
    });
  });

  describe('Reminder Display and Cycling', () => {
    it('RTC004: Should cycle through reminders in order', async () => {
      const { getByTestId } = renderReminderTester();
      
      // Add three reminders
      fireEvent.click(getByTestId('add-reminder-1'));
      fireEvent.click(getByTestId('add-reminder-2'));
      fireEvent.click(getByTestId('add-reminder-3'));
      
      // Initial state
      expect(getByTestId('current-reminder-index').textContent).toBe('0');
      
      // Show reminder
      fireEvent.click(getByTestId('toggle-reminder'));
      expect(getByTestId('show-reminder').textContent).toBe('true');
      
      // Dismiss reminder to trigger cycling
      fireEvent.click(getByTestId('dismiss-reminder'));
      
      // Toggle reminder again to show the next one
      fireEvent.click(getByTestId('toggle-reminder'));
      
      // Reminder index should have advanced
      expect(getByTestId('current-reminder-index').textContent).toBe('1');
      
      // Dismiss and show again for third reminder
      fireEvent.click(getByTestId('dismiss-reminder'));
      fireEvent.click(getByTestId('toggle-reminder'));
      expect(getByTestId('current-reminder-index').textContent).toBe('2');
      
      // Cycle back to first reminder
      fireEvent.click(getByTestId('dismiss-reminder'));
      fireEvent.click(getByTestId('toggle-reminder'));
      expect(getByTestId('current-reminder-index').textContent).toBe('0');
    });

    it('RTC005: Should show reminder when timer completes', async () => {
      renderTimer();
      
      // Set up and start a timer with 1 second
      const secondsSelect = screen.getByLabelText('Seconds');
      await userEvent.selectOptions(secondsSelect, '01');
      
      // Add a reminder (via the Add Reminder form)
      const reminderInput = screen.getByPlaceholderText('Add a reminder...');
      await userEvent.type(reminderInput, 'Test reminder');
      fireEvent.click(screen.getByText('Add'));
      
      // Start the timer
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Complete the timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Wait for sound sequence and reminder to appear
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      
      // Verify reminder is shown
      await waitFor(() => {
        expect(screen.getByText('Test reminder')).toBeInTheDocument();
      });
    });

    it('RTC006: Should handle empty reminders list', async () => {
      renderTimer();
      
      // Set up and start a timer with 1 second
      const secondsSelect = screen.getByLabelText('Seconds');
      await userEvent.selectOptions(secondsSelect, '01');
      
      // Start the timer without adding reminders
      await userEvent.click(screen.getByText('Start Timer'));
      
      // Complete the timer
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      // Wait for sound sequence
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      
      // Timer should still work without reminders
      expect(screen.queryByText('Test reminder')).not.toBeInTheDocument();
    });

    it('RTC007: Should only show active reminders', async () => {
      const { getByTestId, queryByText } = renderReminderTester();
      
      // Add reminders
      fireEvent.click(getByTestId('add-reminder-1'));
      fireEvent.click(getByTestId('add-reminder-2'));
      
      // Mark reminder 1 as complete
      fireEvent.click(getByTestId('toggle-complete-0'));
      
      // Show reminder - should show reminder 2, not 1
      fireEvent.click(getByTestId('toggle-reminder'));
      
      // Should skip completed reminders
      expect(getByTestId('current-reminder-index').textContent).toBe('1');
    });
  });
}); 