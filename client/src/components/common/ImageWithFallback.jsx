import React, { useState } from 'react';
import { ImageIcon, AlertCircle } from 'lucide-react';

const ImageWithFallback = ({
  src,
  alt,
  className,
  useProxy = false,
  crossOrigin = undefined,
  loading = "lazy",
  // "cover" (default, unchanged) crops to fill the frame — used everywhere
  // that already relies on today's behavior. Pass fit="contain" to instead
  // show the complete image, letterboxed, with no cropping/stretching.
  fit = "cover",
}) => {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no source is provided at all
  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        <ImageIcon size={24} className="mb-1" />
        <span className="text-[10px] font-medium">No Image</span>
      </div>
    );
  }

  // Determine final image URL
  const envUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? 'http://localhost:5000' : '');
  
  // Ensure we have both base and api URLs correctly formatted
  const baseUrl = envUrl.endsWith('/api') ? envUrl.replace('/api', '') : envUrl;
  const apiUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  
  let finalSrc = src;
  
  // If it's a relative path (like uploads/)
  if (src.startsWith('uploads/')) {
    finalSrc = `${baseUrl}/${src}`;
  } 
  else if (src.startsWith('/uploads/')) {
    finalSrc = `${baseUrl}${src}`;
  }
  // If we need proxy to bypass CORS (especially for html2canvas/PDF)
  else if (useProxy && src.startsWith('http')) {
    finalSrc = `${apiUrl}/proxy-image?url=${encodeURIComponent(src)}`;
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-400 p-2 text-center">
          <AlertCircle size={20} className="mb-1 text-red-500" />
          <span className="text-[10px] font-medium text-red-600 leading-tight">Load Error</span>
        </div>
      ) : (
        <img
          src={finalSrc}
          alt={alt || "Image"}
          className={`w-full h-full ${fitClass} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={(e) => {
            console.error(`❌ Failed to load image: ${finalSrc}`);
            setHasError(true);
            setIsLoading(false);
          }}
          crossOrigin={useProxy ? "anonymous" : crossOrigin}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
