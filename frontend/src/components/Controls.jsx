/**
 * Controls Component
 * Provides UI controls for camera and translation mode
 */

import React from 'react';

const Controls = ({
  isCapturing = false,
  onToggleCapture = () => {},
  onToggleDarkMode = () => {},
  isDarkMode = true,
  onClearHistory = () => {},
  historyCount = 0,
}) => {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-gray-900 rounded-lg">
      {/* Capture Mode Toggle */}
      <button
        onClick={onToggleCapture}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isCapturing
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
      >
        {isCapturing ? '⏸ Stop Capturing' : '▶ Start Capturing'}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={onToggleDarkMode}
        className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-gray-300"
      >
        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Clear History Button */}
      <button
        onClick={onClearHistory}
        disabled={historyCount === 0}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          historyCount === 0
            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
            : 'bg-orange-600 hover:bg-orange-700 text-white'
        }`}
      >
        🗑️ Clear History ({historyCount})
      </button>
    </div>
  );
};

export default Controls;
