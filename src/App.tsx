import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import TimerProvider from './context/TimerContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Timer from './pages/Timer';
import Statistics from './pages/Statistics';
import Checklist from './pages/Checklist';
import Settings from './pages/Settings';
import Tools from './pages/Tools';
import Journal from './pages/Journal';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <TimerProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/checklist" element={<Checklist />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/journal" element={<Journal />} />
            </Routes>
          </Layout>
        </TimerProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;