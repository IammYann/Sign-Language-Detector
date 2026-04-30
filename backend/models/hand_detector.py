"""
Hand detection using MediaPipe
Detects hand landmarks from video frames
"""

import cv2
import numpy as np
from typing import Optional, Tuple, List
import mediapipe as mp
from utils.config import MIN_DETECTION_CONFIDENCE, MIN_TRACKING_CONFIDENCE


class HandDetector:
    """Detects hand landmarks in video frames using MediaPipe"""

    def __init__(
        self,
        min_detection_confidence: float = MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence: float = MIN_TRACKING_CONFIDENCE,
        max_num_hands: int = 2
    ):
        """
        Initialize the hand detector

        Args:
            min_detection_confidence: Minimum confidence for hand detection
            min_tracking_confidence: Minimum confidence for hand tracking
            max_num_hands: Maximum number of hands to detect
        """
        # Use the old solutions API if available, otherwise fallback
        try:
            # Try old API first
            self.hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=max_num_hands,
                min_detection_confidence=min_detection_confidence,
                min_tracking_confidence=min_tracking_confidence
            )
            self.mp_drawing = mp.solutions.drawing_utils
            self.mp_hands = mp.solutions.hands
            self.use_old_api = True
        except AttributeError:
            # Fallback to new tasks API
            # For now, raise an error since we need to implement the new API properly
            raise ImportError("MediaPipe solutions API not available. Please use MediaPipe version with solutions support.")

        self.landmarks_list = []

    def detect(self, frame: np.ndarray) -> Tuple[Optional[List], np.ndarray]:
        """
        Detect hand landmarks in a frame

        Args:
            frame: Input video frame (BGR format from OpenCV)

        Returns:
            Tuple of (landmarks_list, annotated_frame)
        """
        if not self.use_old_api:
            raise NotImplementedError("New MediaPipe API not yet implemented")

        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)

        annotated_frame = frame.copy()
        landmarks_list = []

        if results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(
                results.multi_hand_landmarks,
                results.multi_handedness
            ):
                # Extract landmarks
                landmarks = self._extract_landmarks(
                    hand_landmarks,
                    frame.shape
                )
                landmarks_list.append({
                    "landmarks": landmarks,
                    "handedness": handedness.classification[0].label,
                    "confidence": handedness.classification[0].score
                })

                # Draw landmarks on frame
                self.mp_drawing.draw_landmarks(
                    annotated_frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS
                )

        return landmarks_list, annotated_frame

    def _extract_landmarks(
        self,
        hand_landmarks,
        frame_shape: Tuple[int, int, int]
    ) -> np.ndarray:
        """
        Extract normalized landmarks from hand detection

        Args:
            hand_landmarks: MediaPipe hand landmarks
            frame_shape: Shape of the input frame

        Returns:
            Normalized landmarks array
        """
        landmarks = []
        height, width = frame_shape[:2]

        for landmark in hand_landmarks.landmark:
            x = landmark.x * width
            y = landmark.y * height
            z = landmark.z
            landmarks.append([x, y, z])

        return np.array(landmarks)

    def get_hand_distance(self, landmarks: np.ndarray) -> float:
        """
        Calculate hand size based on landmark distance

        Args:
            landmarks: Hand landmarks array

        Returns:
            Distance between wrist and middle finger
        """
        if len(landmarks) < 9:
            return 0.0

        wrist = landmarks[0]
        middle_tip = landmarks[12]
        distance = np.linalg.norm(middle_tip - wrist)
        return distance

    def release(self):
        """Release resources"""
        if hasattr(self, 'hands') and self.use_old_api:
            self.hands.close()
