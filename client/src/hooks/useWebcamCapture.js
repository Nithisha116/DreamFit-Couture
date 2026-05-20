import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';

export function useWebcamCapture() {
  const [cameraState, setCameraState] = useState({
    status: 'idle', // idle, loading, ready, error, denied
    errorMsg: '',
  });
  const [facingMode, setFacingMode] = useState('environment'); // Default to rear camera on mobile

  // Switch between front and rear cameras
  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  // Base64 to Blob conversion
  const base64ToBlob = (base64, mimeType = 'image/jpeg') => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
  };

  // Convert Base64 directly to compressed File
  const processCapturedImage = async (base64String, type = 'capture', quality = 'Medium') => {
    if (!base64String) return null;

    try {
      // 1. Convert to Blob
      const blob = base64ToBlob(base64String, 'image/jpeg');

      // 2. Create standard File from Blob
      const filename = `${type}-capture-${Date.now()}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });

      // 3. Setup compression options based on quality
      let maxSizeMB = 1;
      let maxWidthOrHeight = 1920;

      if (quality === 'Low') {
        maxSizeMB = 0.3;
        maxWidthOrHeight = 1024;
      } else if (quality === 'High') {
        maxSizeMB = 3;
        maxWidthOrHeight = 3840;
      }

      const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };

      // 4. Compress the File
      const compressedBlob = await imageCompression(file, options);
      
      // 5. Create final File object with metadata properties
      const compressedFile = new File([compressedBlob], filename, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      
      // Attach custom metadata directly to the File object (will not be serialized in FormData directly,
      // but useful for UI state or if we extract it before append)
      compressedFile.source = 'webcam';
      compressedFile.capturedAt = Date.now();
      compressedFile.deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

      return compressedFile;
    } catch (error) {
      console.error('Error processing captured image:', error);
      throw error;
    }
  };

  const handleUserMedia = useCallback(() => {
    setCameraState({ status: 'ready', errorMsg: '' });
  }, []);

  const handleUserMediaError = useCallback((error) => {
    console.error('Camera access error:', error);
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      setCameraState({ status: 'denied', errorMsg: 'Camera permission denied. Please enable access in browser settings.' });
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      setCameraState({ status: 'error', errorMsg: 'No camera device found on this device.' });
    } else {
      setCameraState({ status: 'error', errorMsg: 'Unable to access the camera.' });
    }
  }, []);

  const startCamera = useCallback(() => {
    setCameraState({ status: 'loading', errorMsg: '' });
  }, []);

  return {
    cameraState,
    facingMode,
    toggleCamera,
    handleUserMedia,
    handleUserMediaError,
    startCamera,
    processCapturedImage,
    setCameraState
  };
}
