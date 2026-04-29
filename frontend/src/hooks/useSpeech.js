/**
 * Custom hook for text-to-speech functionality
 */

import { useCallback, useState } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(
    'speechSynthesis' in window
  );

  // Speak text
  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      console.warn('Speech Synthesis is not supported in this browser');
      return;
    }

    const {
      rate = 1,
      pitch = 1,
      volume = 1,
      lang = 'en-US',
    } = options;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported]);

  // Stop speech
  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Get available voices
  const getVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    getVoices,
  };
};

export default useSpeech;
