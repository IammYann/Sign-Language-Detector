"""
Hand detection using MediaPipe
Detects hand landmarks from video frames
"""

import cv2
import numpy as np
from typing import Optional, Tuple, List
from utils.config import MIN_DETECTION_CONFIDENCE, MIN_TRACKING_CONFIDENCE

# Try to import MediaPipe with fallback
mp_hands = None
mp_drawing = None
try:
    import mediapipe as mp
    if hasattr(mp, 'solutions'):
        mp_hands = mp.solutions.hands
        mp_drawing = mp.solutions.drawing_utils
except Exception as e:
    # MediaPipe not available or not properly configured
    # The app will work with stub detection
    pass


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
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence
        self.max_num_hands = max_num_hands
        
        # Initialize MediaPipe Hand detector if available
        self.hands = None
        self.mp_drawing = mp_drawing
        
        if mp_hands is not None:
            try:
                self.hands = mp_hands.Hands(
                    static_image_mode=True,
                    max_num_hands=max_num_hands,
                    min_detection_confidence=min_detection_confidence,
                    min_tracking_confidence=min_tracking_confidence
                )
            except Exception as e:
                print(f"Could not initialize MediaPipe hands: {e}")
        
        self.landmarks_list = []

    def detect(self, frame: np.ndarray) -> Tuple[Optional[List], np.ndarray]:
        """
        Detect hand landmarks in a frame

        Args:
            frame: Input video frame (BGR format from OpenCV)

        Returns:
            Tuple of (landmarks_list, annotated_frame)
        """
        try:
            if self.hands is None:
                # Return empty response if MediaPipe not available
                return [], frame.copy()
            
            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.hands.process(rgb_frame)
            
            annotated_frame = frame.copy()
            landmarks_list = []
            
            if results.multi_hand_landmarks and results.multi_handedness:
                for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                    # Extract landmark coordinates
                    landmarks = np.array([
                        [lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark
                    ])
                    
                    landmarks_list.append({
                        "landmarks": landmarks,
                        "handedness": handedness.classification[0].label
                    })
                    
                    # Draw landmarks on frame if drawing utils available
                    if self.mp_drawing is not None:
                        self.mp_drawing.draw_landmarks(
                            annotated_frame,
                            hand_landmarks,
                            mp_hands.HAND_CONNECTIONS
                        )
            
            return landmarks_list, annotated_frame
        except Exception as e:
            print(f"Error in hand detection: {e}")
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
        landmarks = np.array([
            [lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark
        ])
        return landmarks

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
        if hasattr(self, 'hands'):
            self.hands.close()
