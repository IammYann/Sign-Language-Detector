/**
 * API Service
 * Handles all backend API calls
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Detect gesture from image
 * @param {File} imageFile - Image file to detect gesture from
 * @returns {Promise} Detection result
 */
export const detectGesture = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error detecting gesture:', error);
    throw error;
  }
};

/**
 * Detect gestures from multiple images
 * @param {FileList} files - Multiple image files
 * @returns {Promise} Batch detection results
 */
export const batchDetectGestures = async (files) => {
  try {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    const response = await api.post('/batch_detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error in batch detection:', error);
    throw error;
  }
};

/**
 * Get health status
 * @returns {Promise} Health check response
 */
export const getHealthStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

/**
 * Get supported gestures
 * @returns {Promise} List of supported gestures
 */
export const getSupportedGestures = async () => {
  try {
    const response = await api.get('/gestures');
    return response.data;
  } catch (error) {
    console.error('Error fetching gestures:', error);
    throw error;
  }
};

/**
 * Reset models
 * @returns {Promise} Reset response
 */
export const resetModels = async () => {
  try {
    const response = await api.post('/reset');
    return response.data;
  } catch (error) {
    console.error('Error resetting models:', error);
    throw error;
  }
};

export default api;
