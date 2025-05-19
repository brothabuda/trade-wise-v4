import React from 'react';
import { Brain } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const EmotionalTracker: React.FC = () => {
  const {
    trackEmotionalReactivity,
    setTrackEmotionalReactivity,
    emotionalTrackingInterval,
    setEmotionalTrackingInterval,
    customTrackingRingCount,
    setCustomTrackingRingCount
  } = useTimer();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-medium">Emotional Reactivity Tracking</h3>
        </div>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={trackEmotionalReactivity}
              onChange={(e) => setTrackEmotionalReactivity(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable tracking</span>
          </label>
        </div>
      </div>

      {trackEmotionalReactivity && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Tracking Frequency</h4>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="trackingInterval"
                  className="form-radio text-blue-600"
                  checked={emotionalTrackingInterval === 'timer'}
                  onChange={() => setEmotionalTrackingInterval('timer')}
                />
                <span className="ml-2">
                  Track at timer completion
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="trackingInterval"
                  className="form-radio text-blue-600"
                  checked={emotionalTrackingInterval === 'custom'}
                  onChange={() => setEmotionalTrackingInterval('custom')}
                />
                <span className="ml-2">
                  Custom interval (plays every X timer completions)
                </span>
              </label>
            </div>
          </div>

          {emotionalTrackingInterval === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="99"
                value={customTrackingRingCount}
                onChange={(e) => setCustomTrackingRingCount(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
              />
              <span>timer completions</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionalTracker;