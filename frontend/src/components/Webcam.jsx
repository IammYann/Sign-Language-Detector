/**
 * Webcam Component
 * Displays live webcam feed and handles gesture capture
 */

import React, { useEffect } from 'react';
import useWebcam from '../hooks/useWebcam';

const Webcam = ({ onFrameCapture, isCapturing = false }) => {
  const {
    videoRef,
    canvasRef,
    isActive,
    error,
    startWebcam,
    stopWebcam,
    getFrameBlob,
  } = useWebcam();

  // Capture frames at regular intervals
  useEffect(() => {
    if (!isCapturing || !isActive) return;

    const captureInterval = setInterval(async () => {
      try {
        const blob = await getFrameBlob();
        const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
        onFrameCapture(file);
      } catch (err) {
        console.error('Error capturing frame:', err);
      }
    }, 300); // Capture every 300ms

    return () => clearInterval(captureInterval);
  }, [isCapturing, isActive, getFrameBlob, onFrameCapture]);

  // Handle webcam start button
  const handleStart = async () => {
    await startWebcam();
  };

  // Handle webcam stop button
  const handleStop = () => {
    stopWebcam();
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500 text-white rounded-lg text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleStart}
          disabled={isActive}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          Start Camera
        </button>
        <button
          onClick={handleStop}
          disabled={!isActive}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            !isActive
              ? 'bg-gray-600 cursor-not-allowed text-gray-400'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Stop Camera
        </button>
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
        <span className="text-gray-300">
          {isActive ? 'Camera Active' : 'Camera Inactive'}
        </span>
      </div>
    </div>
  );
};

export default Webcam;
