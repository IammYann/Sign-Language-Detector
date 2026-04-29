/**
 * Main App Component
 * Orchestrates the Sign Language Translator application
 */

import React, { useState, useCallback, useEffect } from 'react';
import Webcam from './components/Webcam';
import TextOutput from './components/TextOutput';
import Controls from './components/Controls';
import History from './components/History';
import { detectGesture } from './utils/api';
import { getAutocompleteSuggestions, isValidGesture } from './utils/gestures';
import './App.css';

function App() {
  // State management
  const [detectedText, setDetectedText] = useState('');
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [history, setHistory] = useState(() => {
    // Load history from localStorage
    try {
      const saved = localStorage.getItem('signLangHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [suggestions, setSuggestions] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');

  // Check API health on mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/health');
        if (response.ok) {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
    };

    checkAPI();
    const interval = setInterval(checkAPI, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('signLangHistory', JSON.stringify(history));
    } catch {
      console.error('Failed to save history to localStorage');
    }
  }, [history]);

  // Handle frame capture from webcam
  const handleFrameCapture = useCallback(
    async (frameFile) => {
      if (!isCapturing || isLoading) return;

      setIsLoading(true);
      try {
        const result = await detectGesture(frameFile);

        if (result.gesture && isValidGesture(result.gesture, result.confidence)) {
          setDetectedGesture(result.gesture);
          setConfidence(result.confidence);

          // Update detected text
          const newText = detectedText + result.gesture;
          setDetectedText(newText);

          // Update suggestions
          const letters = newText.split('').filter((c) => c !== ' ');
          setSuggestions(getAutocompleteSuggestions(letters));

          // Add to history
          if (!history.includes(newText)) {
            setHistory((prev) => [newText, ...prev].slice(0, 50)); // Keep last 50
          }
        }
      } catch (error) {
        console.error('Error detecting gesture:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isCapturing, isLoading, detectedText, history]
  );

  // Handle capture toggle
  const handleToggleCapture = () => {
    setIsCapturing((prev) => !prev);
  };

  // Handle dark mode toggle
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handle text clear
  const handleClearText = () => {
    setDetectedText('');
    setDetectedGesture(null);
    setConfidence(0);
    setSuggestions([]);
  };

  // Handle history clear
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the entire history?')) {
      setHistory([]);
    }
  };

  // Handle history item delete
  const handleDeleteHistoryItem = (index) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  // Add text to detected text
  const addToText = (text) => {
    setDetectedText((prev) => prev + text);
  };

  // Handle space
  const handleAddSpace = () => {
    addToText(' ');
  };

  // Handle delete
  const handleDelete = () => {
    setDetectedText((prev) => prev.slice(0, -1));
  };

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      <div className="min-h-screen bg-gray-950 text-white transition-colors duration-300">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">🤟 Sign Language Translator</h1>
            <p className="text-blue-100">Real-time gesture recognition powered by AI</p>
            <div className="mt-3 flex items-center gap-3">
              <span className={`inline-block w-3 h-3 rounded-full ${
                apiStatus === 'online' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm">
                API Status: <strong>{apiStatus === 'online' ? 'Online' : 'Offline'}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto p-6 space-y-6">
          {/* API Offline Warning */}
          {apiStatus === 'offline' && (
            <div className="p-4 bg-red-900 text-red-100 rounded-lg border border-red-700">
              ⚠️ <strong>Backend API is offline.</strong> Make sure the Python backend is running on port 8000.
            </div>
          )}

          {/* Controls */}
          <Controls
            isCapturing={isCapturing}
            onToggleCapture={handleToggleCapture}
            onToggleDarkMode={handleToggleDarkMode}
            isDarkMode={isDarkMode}
            onClearHistory={handleClearHistory}
            historyCount={history.length}
          />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Webcam Section */}
            <div className="lg:col-span-2">
              <Webcam onFrameCapture={handleFrameCapture} isCapturing={isCapturing} />
            </div>

            {/* Text Output Section */}
            <div className="lg:col-span-1">
              <TextOutput
                detectedText={detectedText}
                confidence={confidence}
                detectedGesture={detectedGesture}
                isLoading={isLoading}
                onClear={handleClearText}
              />
            </div>
          </div>

          {/* Additional Controls */}
          <div className="p-4 bg-gray-900 rounded-lg space-y-3">
            <h3 className="text-lg font-bold text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleAddSpace}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Space
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleClearText}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  if (suggestions.length > 0) {
                    addToText(suggestions[0]);
                  }
                }}
                disabled={suggestions.length === 0}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Autocomplete
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setDetectedText(suggestion);
                        setSuggestions([]);
                      }}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-blue-300 text-sm rounded border border-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* History Section */}
          <History
            history={history}
            onClear={handleClearHistory}
            onItemDelete={handleDeleteHistoryItem}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 p-6 mt-12 text-center text-gray-500">
          <p>© 2024 Sign Language Translator • Powered by MediaPipe & React</p>
          <p className="text-sm mt-2">Tips: Position your hands clearly in frame and make distinct gestures.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
