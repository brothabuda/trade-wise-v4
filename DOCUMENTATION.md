# TradeWise Documentation

## Overview
TradeWise is a comprehensive trading companion application designed to help traders maintain focus and discipline during trading sessions. The application combines timer functionality with psychological tools and trading utilities.

## Core Features

### 1. Timer System
- Custom timer with hours, minutes, and seconds input
- Sound notifications with multiple bell options:
  - Chimes (longer duration)
  - Crystal
  - Deep Copper Bell
  - High Bell
- Configurable sound repeat count (1-3 times)
- Timer controls (start, pause, resume, reset, stop)
- Recurring timer option
- Visual progress indicator
- Session history tracking

### 2. Trading Reminders
- Add, edit, and delete reminders
- Reorder reminders using up/down controls
- Mark reminders as active/inactive
- Mark reminders as complete/incomplete
- Persistent storage using localStorage

### 3. Mindfulness Integration
- Random mindfulness prompts
- Trading-specific psychological guidance
- Focus on emotional awareness

## Technical Implementation

### Architecture
- React with TypeScript
- Context-based state management
  - ThemeContext for dark/light mode
  - TimerContext for timer functionality
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons

### Key Components
1. Layout Components
   - Header with navigation
   - Footer
   - Responsive layout system

2. Timer Components
   - TimerDisplay: Visual timer with progress
   - TimerControls: Timer control buttons
   - CustomTimerInput: Timer configuration
   - ReminderPopup: Reminder notifications
   - SessionHistory: Timer session tracking

3. Pages
   - Home: Landing page with feature overview
   - Timer: Main timer functionality
   - Statistics: Session analytics (planned)
   - Checklist: Pre-trading checklist (planned)
   - Tools: Trading psychology tools (planned)
   - Journal: Trading journal (planned)
   - Settings: Application configuration (planned)

### State Management
Timer state includes:
- Current time remaining
- Timer status (idle, running, paused, completed)
- Initial duration
- Progress percentage
- Session history
- Sound settings
- Reminder configuration

### Data Persistence
- Timer settings stored in localStorage
- Reminders persist between sessions
- Theme preference saved locally

### Sound System
- Multiple sound options
- Configurable repeat count
- Sound sequence management
- Automatic cleanup of audio resources

## Recent Updates

### Timer Sound and Repeat Functionality
- Fixed sound playback issues
- Implemented proper sound cleanup
- Corrected recurring timer functionality
- Enhanced sound sequence management
- Improved timer state handling

### Navigation and Routing
- Implemented multi-page structure
- Added responsive navigation
- Created placeholder pages for future features

### UI/UX Improvements
- Rebranded to TradeWise
- Enhanced reminder controls
- Fixed reminder reordering functionality
- Improved dark mode support

## Testing
- Comprehensive test suite using Vitest
- Timer functionality tests
- Edge case handling
- Sound system testing
- State management verification

## Future Development
1. Statistics Dashboard
   - Session analytics
   - Focus metrics
   - Progress tracking

2. Pre-Trading Checklist
   - Customizable checklist items
   - Daily preparation workflow
   - Market condition assessment

3. Trading Psychology Tools
   - Emotional state tracking
   - Mindfulness exercises
   - Decision-making frameworks

4. Trading Journal
   - Trade documentation
   - Emotional state logging
   - Performance analysis

5. Settings
   - Advanced timer configuration
   - Notification preferences
   - Data management