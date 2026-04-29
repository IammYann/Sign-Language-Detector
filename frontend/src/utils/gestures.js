/**
 * Gesture utilities
 */

// Common words in sign language
export const COMMON_WORDS = {
  'HELLO': ['H', 'E', 'L', 'L', 'O'],
  'GOODBYE': ['G', 'O', 'O', 'D', 'B', 'Y', 'E'],
  'THANK': ['T', 'H', 'A', 'N', 'K'],
  'YES': ['Y', 'E', 'S'],
  'NO': ['N', 'O'],
  'PLEASE': ['P', 'L', 'E', 'A', 'S', 'E'],
};

// Autocomplete suggestions based on detected letters
export const getAutocompleteSuggestions = (letters) => {
  if (!letters || letters.length === 0) return [];

  const suggestions = [];
  const joinedLetters = letters.join('');

  for (const [word, spelling] of Object.entries(COMMON_WORDS)) {
    if (spelling.slice(0, letters.length).join('') === joinedLetters) {
      suggestions.push(word);
    }
  }

  return suggestions;
};

// Convert gesture sequence to words
export const gestureSequenceToWords = (gestures) => {
  const words = [];
  let currentWord = [];

  for (const gesture of gestures) {
    if (gesture === 'space' || gesture === ' ') {
      if (currentWord.length > 0) {
        words.push(currentWord.join(''));
        currentWord = [];
      }
    } else if (gesture === 'del' || gesture === 'delete') {
      currentWord.pop();
    } else if (gesture && gesture !== 'Unknown') {
      currentWord.push(gesture);
    }
  }

  if (currentWord.length > 0) {
    words.push(currentWord.join(''));
  }

  return words;
};

// Format detected text for display
export const formatDetectedText = (text) => {
  if (!text) return '';
  return text.trim();
};

// Validate gesture detection
export const isValidGesture = (gesture, confidence, threshold = 0.7) => {
  return gesture && gesture !== 'Unknown' && confidence >= threshold;
};
