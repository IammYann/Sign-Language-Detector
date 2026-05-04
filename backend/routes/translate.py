"""
API routes for sign language translation
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from typing import List, Dict
import io

from models.hand_detector import HandDetector
from models.gesture_recognizer import GestureRecognizer
from utils.config import CONFIDENCE_THRESHOLD

router = APIRouter()

# Initialize models (singleton pattern)
hand_detector = HandDetector()
gesture_recognizer = GestureRecognizer()


@router.get("/health")
async def health_check() -> Dict:
    """
    Health check endpoint
    
    Returns:
        JSON with health status
    """
    return {
        "status": "healthy",
        "service": "Sign Language Translator API",
        "version": "1.0.0"
    }


@router.post("/detect")
async def detect_gesture(file: UploadFile = File(...)) -> Dict:
    """
    Detect and recognize gestures from an uploaded image

    Args:
        file: Image file (jpg, png, etc.)

    Returns:
        JSON with detected gesture and confidence
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Detect hands
        landmarks_list, annotated_frame = hand_detector.detect(frame)

        if not landmarks_list:
            return {
                "gesture": None,
                "confidence": 0.0,
                "hand_detected": False,
                "message": "No hand detected in the image"
            }

        # Recognize gesture from first hand
        landmarks = landmarks_list[0]["landmarks"]
        gesture, confidence = gesture_recognizer.recognize(landmarks)

        # Apply smoothing
        gesture, confidence = gesture_recognizer.smooth_prediction(gesture, confidence)

        return {
            "gesture": gesture if confidence >= CONFIDENCE_THRESHOLD else None,
            "confidence": float(confidence),
            "hand_detected": True,
            "handedness": landmarks_list[0]["handedness"],
            "num_hands": len(landmarks_list)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch_detect")
async def batch_detect(files: List[UploadFile] = File(...)) -> Dict:
    """
    Detect gestures from multiple images

    Args:
        files: List of image files

    Returns:
        JSON with detected gestures for each image
    """
    try:
        results = []

        for file in files:
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            landmarks_list, _ = hand_detector.detect(frame)

            if not landmarks_list:
                results.append({
                    "filename": file.filename,
                    "gesture": None,
                    "confidence": 0.0
                })
                continue

            landmarks = landmarks_list[0]["landmarks"]
            gesture, confidence = gesture_recognizer.recognize(landmarks)
            gesture, confidence = gesture_recognizer.smooth_prediction(gesture, confidence)

            results.append({
                "filename": file.filename,
                "gesture": gesture if confidence >= CONFIDENCE_THRESHOLD else None,
                "confidence": float(confidence)
            })

        return {"results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check() -> Dict:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Sign Language Translator API is running"
    }


@router.post("/reset")
async def reset_models() -> Dict:
    """Reset the gesture recognizer buffer"""
    try:
        gesture_recognizer.reset_buffer()
        return {
            "status": "success",
            "message": "Models reset successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
