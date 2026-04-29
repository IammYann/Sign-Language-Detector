/**
 * TextOutput Component
 * Displays detected text, confidence, and provides text-to-speech
 */

import React from 'react';
import useSpeech from '../hooks/useSpeech';

const TextOutput = ({
  detectedText = '',
  confidence = 0,
  detectedGesture = null,
  isLoading = false,
  onClear = () => {},
}) => {
  const { speak, stop, isSpeaking, isSupported } = useSpeech();

  const handleSpeak = () => {
    if (detectedText) {
      speak(detectedText, {
        rate: 1,
        pitch: 1,
        volume: 1,
        lang: 'en-US',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(detectedText);
  };

  const handleClear = () => {
    stop();
    onClear();
  };

  const isConfident = confidence >= 0.7;
  const confidenceColor = isConfident ? 'bg-green-600' : 'bg-yellow-600';

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg">
      {/* Gesture Display */}
      {detectedGesture && (
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-400 mb-2">
            {detectedGesture}
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="text-sm text-gray-400">Confidence</div>
            <div className={`${confidenceColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
              {(confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Text Output */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Detected Text
        </label>
        <textarea
          value={detectedText}
          readOnly
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 resize-none h-24"
          placeholder="Your detected text will appear here..."
        />
      </div>

      {/* Text Stats */}
      {detectedText && (
        <div className="flex gap-4 text-sm text-gray-400">
          <div>
            <span className="font-medium">Characters:</span> {detectedText.length}
          </div>
          <div>
            <span className="font-medium">Words:</span> {detectedText.split(/\s+/).filter(Boolean).length}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {isSupported && (
          <>
            <button
              onClick={handleSpeak}
              disabled={!detectedText || isSpeaking || isLoading}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                !detectedText || isSpeaking || isLoading
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
            </button>
            {isSpeaking && (
              <button
                onClick={stop}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Stop
              </button>
            )}
          </>
        )}

        <button
          onClick={handleCopy}
          disabled={!detectedText}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            !detectedText
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          📋 Copy
        </button>

        <button
          onClick={handleClear}
          disabled={!detectedText && !detectedGesture}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            !detectedText && !detectedGesture
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Clear
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-blue-400">
          <div className="animate-spin">⚙️</div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
};

export default TextOutput;
