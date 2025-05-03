import React from 'react';
import { useTimer } from '../context/TimerContext';
import { presetToSeconds } from '../utils/timerUtils';

const TimerPresets: React.FC = () => {
  const { status } = useTimer();
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);
  
  // Only show presets when the timer is idle or completed
  if (status !== 'idle' && status !== 'completed') {
    return null;
  }
  
  const presets = [
    { label: '1m', value: '1m', seconds: 60 },
    { label: '3m', value: '3m', seconds: 180 },
    { label: '5m', value: '5m', seconds: 300 },
    { label: '15m', value: '15m', seconds: 900 },
    { label: '30m', value: '30m', seconds: 1800 }
  ];

  const handlePresetClick = (preset: { value: string, seconds: number }) => {
    setSelectedPreset(preset.value);
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3 text-center">Quick Presets</h3>
      <div className="grid grid-cols-5 gap-2 sm:gap-4">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset)}
            className={`py-2 px-4 rounded-lg transition-colors font-medium ${
              selectedPreset === preset.value
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-100'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimerPresets;