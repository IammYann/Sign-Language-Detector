"""
Hand detection using MediaPipe
Detects hand landmarks from video frames
"""

import cv2
import numpy as np
from typing import Optional, Tuple, List
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
        # For now, create a stub implementation that doesn't crash
        # TODO: Fix MediaPipe compatibility issues
        self.use_stub = True
        print("Warning: Using stub hand detector - MediaPipe compatibility issues detected")

        self.landmarks_list = []

    def detect(self, frame: np.ndarray) -> Tuple[Optional[List], np.ndarray]:
        """
        Detect hand landmarks in a frame

        Args:
            frame: Input video frame (BGR format from OpenCV)

        Returns:
            Tuple of (landmarks_list, annotated_frame)
        """
        if self.use_stub:
            # Return stub response for now
            annotated_frame = frame.copy()
            landmarks_list = []  # Empty list - no hands detected
            return landmarks_list, annotated_frame

        # TODO: Implement actual detection when MediaPipe issues are resolved
        return [], frame.copy()

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
        # Stub implementation
        return np.array([])

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
        # Stub implementation - no resources to release
        pass
