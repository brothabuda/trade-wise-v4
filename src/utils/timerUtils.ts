/**
 * Format seconds into HH:mm:ss format
 */
export const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Convert hours, minutes and seconds to total seconds
 */
export const toSeconds = (hours: number, minutes: number, seconds: number): number => {
  return (hours * 3600) + (minutes * 60) + seconds;
};

/**
 * Convert a preset string to seconds
 */
export const presetToSeconds = (preset: string): number => {
  switch (preset) {
    case '1m': return 60;
    case '3m': return 180;
    case '5m': return 300;
    case '15m': return 900;
    case '30m': return 1800;
    default: return 0;
  }
};

/**
 * Get a random mindfulness prompt
 */
export const getMindfulnessPrompt = (): string => {
  const prompts = [
    "Take a deep breath and notice how your body feels",
    "Focus on the sounds around you",
    "Notice the weight of your body where you're sitting",
    "Observe your thoughts without judgment",
    "Feel the temperature of the air on your skin",
    "Listen to your breathing pattern",
    "Notice any tension in your muscles",
    "Be aware of your posture",
    "Observe how your chest rises and falls",
    "Focus on the present moment"
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
};