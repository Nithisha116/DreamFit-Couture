import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, Check, SwitchCamera, AlertCircle, Settings } from 'lucide-react';
import { useWebcamCapture } from '../../hooks/useWebcamCapture';
import showToast from '../../utils/toast';

const WebcamCapture = ({ isOpen, onClose, onCapture, captureType = 'image' }) => {
  const webcamRef = useRef(null);
  const {
    cameraState,
    facingMode,
    toggleCamera,
    handleUserMedia,
    handleUserMediaError,
    startCamera,
    processCapturedImage,
    setCameraState
  } = useWebcamCapture();

  const [capturedBase64, setCapturedBase64] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState('Medium');

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setCapturedBase64(null);
    }
  }, [isOpen, startCamera]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedBase64(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedBase64(null);
  };

  const handleSave = async () => {
    if (!capturedBase64) return;
    
    setIsProcessing(true);
    try {
      // Process converts Base64 -> Blob -> Compressed File
      const file = await processCapturedImage(capturedBase64, captureType, quality);
      onCapture(file);
      onClose();
    } catch (error) {
      showToast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Render Camera Loading/Error States
  const renderCameraState = () => {
    if (cameraState.status === 'loading') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-medium">Initializing Camera...</p>
        </div>
      );
    }

    if (cameraState.status === 'denied') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 px-6 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Camera Access Denied</h3>
          <p className="text-slate-400 mb-6">Please enable camera access in your browser settings to take photos.</p>
          <button 
            onClick={() => {
              // Resetting state forces webcam remount/retry in some browsers
              setCameraState({ status: 'loading', errorMsg: '' });
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2"
          >
            <Settings size={20} />
            Retry Access
          </button>
        </div>
      );
    }

    if (cameraState.status === 'error') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 px-6 text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Camera Error</h3>
          <p className="text-slate-400 mb-6">{cameraState.errorMsg || 'Unable to access the camera.'}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center justify-between z-20">
        <button onClick={onClose} className="p-2 text-white hover:bg-slate-800 rounded-full transition-colors">
          <X size={24} />
        </button>
        
        {!capturedBase64 && (
          <div className="flex items-center gap-4">
            <select 
              value={quality} 
              onChange={(e) => setQuality(e.target.value)}
              className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border-none outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low Quality</option>
              <option value="Medium">Medium Quality</option>
              <option value="High">High Quality</option>
            </select>

            <button onClick={toggleCamera} className="p-2 text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
              <SwitchCamera size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Main Viewfinder Area */}
      <div className="flex-1 relative bg-black flex flex-col justify-center overflow-hidden">
        {renderCameraState()}
        
        {!capturedBase64 ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode, width: 1920, height: 1080 }}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="w-full h-full object-cover"
            playsInline // IMPORTANT FOR IOS SAFARI
            muted // IMPORTANT FOR IOS SAFARI
          />
        ) : (
          <img src={capturedBase64} alt="Captured" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Bottom Controls - Touch Friendly */}
      <div className="bg-slate-900 p-6 pb-10 z-20">
        {!capturedBase64 ? (
          <div className="flex justify-center items-center h-24">
            <button 
              onClick={capture}
              disabled={cameraState.status !== 'ready'}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 cursor-pointer active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-full h-full border-2 border-slate-900 rounded-full flex items-center justify-center">
                <div className="w-[68px] h-[68px] bg-white rounded-full border-4 border-slate-900 shadow-inner"></div>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 h-24">
            <button 
              onClick={retake}
              disabled={isProcessing}
              className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={24} />
              Retake
            </button>
            <button 
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={24} />
                  Use Photo
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
