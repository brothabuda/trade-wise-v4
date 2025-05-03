import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';

interface EmotionalRatingPopupProps {
  onDismiss: () => void;
}

const EmotionalRatingPopup: React.FC<EmotionalRatingPopupProps> = ({ onDismiss }) => {
  const { addEmotionalRating } = useTimer();
  const [rating, setRating] = useState(5);
  const [isVisible, setIsVisible] = useState(false);

  // Add animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    addEmotionalRating(rating);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 transition-all duration-300 ${isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}>
        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">How emotionally reactive are you feeling right now?</h3>
        
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">Completely calm & focused</span>
              <span className="text-red-600 dark:text-red-400">Highly reactive & emotional</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="emotional-slider w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save Rating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalRatingPopup; 