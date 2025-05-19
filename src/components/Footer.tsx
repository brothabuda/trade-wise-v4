import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`py-4 px-6 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}`}>
      <div className="container mx-auto text-center text-sm">
        <p>© {new Date().getFullYear()} Cool Head | Stay focused, trade mindfully</p>
      </div>
    </footer>
  );
};

export default Footer;