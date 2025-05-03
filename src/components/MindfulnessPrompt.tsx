import React, { useState, useEffect } from 'react';
import { useTimer } from '../context/TimerContext';
import { getMindfulnessPrompt } from '../utils/timerUtils';
import { BrainCircuit } from 'lucide-react';

const MindfulnessPrompt: React.FC = () => {
  const { status } = useTimer();
  const [prompt, setPrompt] = useState('');
  
  // Update prompt when timer status changes
  useEffect(() => {
    setPrompt(getMindfulnessPrompt());
  }, [status]);
  
  // Generate a new prompt
  const refreshPrompt = () => {
    setPrompt(getMindfulnessPrompt());
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center mb-3">
        <BrainCircuit className="h-5 w-5 mr-2 text-teal-600 dark:text-teal-400" />
        <h3 className="text-lg font-medium">Mindfulness Prompt</h3>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{prompt}"</p>
      
      <button
        onClick={refreshPrompt}
        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
      >
        New prompt
      </button>
    </div>
  );
};

export default MindfulnessPrompt;