/**
 * Custom hook for webcam access and frame capture
 */

import { useRef, useState, useCallback, useEffect } from 'react';

export const useWebcam = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const streamRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(isMobileDevice);
  }, []);

  // Initialize webcam
  const startWebcam = useCallback(async () => {
    try {
      setError(null);

      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: isMobile ? 'user' : 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error accessing webcam:', err);
    }
  }, [isMobile]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);

    return canvas;
  }, []);

  // Get canvas blob
  const getFrameBlob = useCallback(
    (quality = 0.8) => {
      return new Promise((resolve, reject) => {
        const canvas = captureFrame();
        if (!canvas) {
          reject(new Error('Failed to capture frame'));
          return;
        }

        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          quality
        );
      });
    },
    [captureFrame]
  );

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    startWebcam,
    stopWebcam,
    captureFrame,
    getFrameBlob,
    isMobile,
  };
};

export default useWebcam;
