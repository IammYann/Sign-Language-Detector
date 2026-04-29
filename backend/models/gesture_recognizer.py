"""
Gesture recognition using hand landmarks
Recognizes ASL alphabet based on MediaPipe hand landmarks
"""

import numpy as np
from typing import Tuple, Dict
from utils.config import CONFIDENCE_THRESHOLD, FRAME_BUFFER_SIZE, ASL_ALPHABET


class GestureRecognizer:
    """Recognizes hand gestures from landmarks"""

    def __init__(self, confidence_threshold: float = CONFIDENCE_THRESHOLD):
        """
        Initialize the gesture recognizer

        Args:
            confidence_threshold: Minimum confidence for gesture recognition
        """
        self.confidence_threshold = confidence_threshold
        self.frame_buffer = []
        self.buffer_size = FRAME_BUFFER_SIZE

    def recognize(self, landmarks: np.ndarray) -> Tuple[str, float]:
        """
        Recognize a gesture from hand landmarks

        Args:
            landmarks: Hand landmarks array (21 points)

        Returns:
            Tuple of (gesture_label, confidence_score)
        """
        if landmarks is None or len(landmarks) < 21:
            return "Unknown", 0.0

        # Calculate gesture features
        features = self._extract_features(landmarks)

        # Recognize gesture based on features
        gesture, confidence = self._classify_gesture(features)

        return gesture, confidence

    def _extract_features(self, landmarks: np.ndarray) -> Dict:
        """
        Extract geometric features from hand landmarks

        Args:
            landmarks: Hand landmarks array

        Returns:
            Dictionary of extracted features
        """
        # Normalize landmarks
        landmarks = self._normalize_landmarks(landmarks)

        # Calculate distances between key points
        features = {
            "thumb_extended": self._is_finger_extended(landmarks, 3, 4),
            "index_extended": self._is_finger_extended(landmarks, 5, 8),
            "middle_extended": self._is_finger_extended(landmarks, 9, 12),
            "ring_extended": self._is_finger_extended(landmarks, 13, 16),
            "pinky_extended": self._is_finger_extended(landmarks, 17, 20),
            "hand_angle": self._calculate_hand_angle(landmarks),
            "hand_spread": self._calculate_hand_spread(landmarks),
            "thumb_position": self._get_finger_position(landmarks, 4),
        }

        return features

    def _normalize_landmarks(self, landmarks: np.ndarray) -> np.ndarray:
        """
        Normalize landmarks relative to hand center

        Args:
            landmarks: Raw hand landmarks

        Returns:
            Normalized landmarks
        """
        # Use wrist as reference point
        wrist = landmarks[0]
        normalized = landmarks - wrist

        # Scale by hand size
        hand_size = np.linalg.norm(landmarks[12] - landmarks[0])
        if hand_size > 0:
            normalized = normalized / hand_size

        return normalized

    def _is_finger_extended(self, landmarks: np.ndarray, pip_idx: int, tip_idx: int) -> float:
        """
        Check if a finger is extended

        Args:
            landmarks: Normalized hand landmarks
            pip_idx: Index of PIP joint
            tip_idx: Index of finger tip

        Returns:
            Extension score (0-1)
        """
        pip = landmarks[pip_idx]
        tip = landmarks[tip_idx]

        distance = np.linalg.norm(tip - pip)
        # Extended if distance is large
        return min(distance, 1.0)

    def _calculate_hand_angle(self, landmarks: np.ndarray) -> float:
        """
        Calculate hand orientation angle

        Args:
            landmarks: Normalized hand landmarks

        Returns:
            Angle in radians
        """
        wrist = landmarks[0]
        middle_mcp = landmarks[9]

        vector = middle_mcp - wrist
        angle = np.arctan2(vector[1], vector[0])
        return angle

    def _calculate_hand_spread(self, landmarks: np.ndarray) -> float:
        """
        Calculate how spread out the fingers are

        Args:
            landmarks: Normalized hand landmarks

        Returns:
            Spread score (0-1)
        """
        # Distance between thumb and pinky
        thumb_tip = landmarks[4]
        pinky_tip = landmarks[20]
        spread = np.linalg.norm(pinky_tip - thumb_tip)
        return min(spread, 1.0)

    def _get_finger_position(self, landmarks: np.ndarray, finger_idx: int) -> str:
        """
        Get relative position of a finger

        Args:
            landmarks: Normalized hand landmarks
            finger_idx: Index of the finger

        Returns:
            Position description
        """
        finger = landmarks[finger_idx]
        palm_center = landmarks[0:10].mean(axis=0)

        if finger[0] < palm_center[0]:
            return "left"
        elif finger[0] > palm_center[0]:
            return "right"
        else:
            return "center"

    def _classify_gesture(self, features: Dict) -> Tuple[str, float]:
        """
        Classify gesture based on extracted features

        Args:
            features: Dictionary of extracted features

        Returns:
            Tuple of (gesture_label, confidence)
        """
        # Simplified gesture recognition using feature patterns
        # In production, you would use a trained ML model

        # Check for common gestures
        thumb = features["thumb_extended"]
        index = features["index_extended"]
        middle = features["middle_extended"]
        ring = features["ring_extended"]
        pinky = features["pinky_extended"]
        spread = features["hand_spread"]

        confidence = 0.0
        gesture = "Unknown"

        # A - thumb up, other fingers closed
        if thumb > 0.6 and index < 0.3 and middle < 0.3 and ring < 0.3 and pinky < 0.3:
            gesture = "A"
            confidence = 0.85

        # B - all fingers extended and together
        elif (index > 0.8 and middle > 0.8 and ring > 0.8 and pinky > 0.8 and thumb < 0.4):
            gesture = "B"
            confidence = 0.85

        # C - hand spread, thumb to side
        elif spread > 0.6 and thumb < 0.5:
            gesture = "C"
            confidence = 0.80

        # I - pinky and index extended
        elif index > 0.7 and pinky > 0.7 and middle < 0.4 and ring < 0.4:
            gesture = "I"
            confidence = 0.85

        # L - thumb and index extended
        elif thumb > 0.6 and index > 0.7 and middle < 0.3:
            gesture = "L"
            confidence = 0.85

        # O - all fingers curved/closed
        elif thumb < 0.4 and index < 0.4 and middle < 0.4:
            gesture = "O"
            confidence = 0.80

        # V - index and middle extended
        elif index > 0.8 and middle > 0.8 and ring < 0.3 and pinky < 0.3:
            gesture = "V"
            confidence = 0.85

        # Y - thumb and pinky extended
        elif thumb > 0.6 and pinky > 0.7 and middle < 0.3:
            gesture = "Y"
            confidence = 0.85

        # Default confidence is low
        confidence = max(confidence, 0.1)

        return gesture, confidence

    def smooth_prediction(self, gesture: str, confidence: float) -> Tuple[str, float]:
        """
        Smooth predictions using frame buffer

        Args:
            gesture: Current gesture prediction
            confidence: Current confidence score

        Returns:
            Smoothed gesture and confidence
        """
        self.frame_buffer.append((gesture, confidence))

        # Keep buffer size limited
        if len(self.frame_buffer) > self.buffer_size:
            self.frame_buffer.pop(0)

        # Return most common gesture with average confidence
        if len(self.frame_buffer) > 0:
            gestures = [g[0] for g in self.frame_buffer]
            confidences = [g[1] for g in self.frame_buffer]

            from collections import Counter
            most_common = Counter(gestures).most_common(1)[0][0]
            avg_confidence = np.mean(confidences)

            return most_common, avg_confidence

        return gesture, confidence

    def reset_buffer(self):
        """Reset the frame buffer"""
        self.frame_buffer = []
