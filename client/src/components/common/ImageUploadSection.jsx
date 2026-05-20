import React, { useState, useRef } from 'react';
import { Upload, Camera, Trash2 } from 'lucide-react';
import WebcamCapture from './WebcamCapture';
import showToast from '../../utils/toast';

const ImageUploadSection = ({
  title,
  subtitle,
  icon: Icon,
  theme = 'blue',
  images = [],
  onImagesChange,
  onRemoveExisting,
  type = 'image',
  maxSizeMB = 5
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const themeClasses = {
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-300',
      hover: 'hover:bg-indigo-50'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-300',
      hover: 'hover:bg-green-50'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-300',
      hover: 'hover:bg-orange-50'
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-300',
      hover: 'hover:bg-blue-50'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.blue;

  const handleFilesAdded = (files) => {
    const validFiles = [];
    
    Array.from(files).forEach(file => {
      // Validate Size
      if (file.size > maxSizeMB * 1024 * 1024) {
        showToast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }
      // Validate Type
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
        showToast.error(`${file.name} is not a valid image (JPG, PNG, WEBP only)`);
        return;
      }
      
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      });
    });

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleWebcamCapture = (file) => {
    if (file) {
      const newImage = {
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      };
      onImagesChange([...images, newImage]);
      showToast.success("Photo captured successfully!");
    }
  };

  const handleRemove = (index, img) => {
    if (img.isExisting && onRemoveExisting) {
      onRemoveExisting(index, img);
    } else {
      // Revoke object URL to free memory
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
      const newImages = [...images];
      newImages.splice(index, 1);
      onImagesChange(newImages);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 ${currentTheme.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon size={16} className={`${currentTheme.text} sm:w-4 sm:h-4`} />}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{title}</h4>
          {subtitle && <p className="text-[8px] sm:text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>

      {/* Upload/Capture Container */}
      <div 
        className="border-2 border-dashed border-slate-300 rounded-lg sm:rounded-xl p-2 sm:p-4 bg-white"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-4">
          
          {/* Action Buttons: Always first two slots or mixed */}
          <div className="col-span-2 grid grid-cols-2 gap-2 mb-2 sm:col-span-full sm:mb-4">
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 border-slate-200 border-dashed hover:border-slate-300 bg-slate-50 transition-colors`}
              >
                <Upload size={20} className="text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-600">Upload Files</span>
             </button>

             <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 border-dashed ${currentTheme.border} ${currentTheme.bg} ${currentTheme.hover} transition-colors`}
              >
                <Camera size={20} className={`${currentTheme.text} mb-2`} />
                <span className={`text-xs font-bold ${currentTheme.text}`}>Take Photo</span>
             </button>
             
             <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/jpeg, image/png, image/jpg, image/webp"
                className="hidden"
                onChange={handleFileInput}
              />
          </div>

          {/* Previews */}
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={img.preview || img.url}
                alt={`${type} ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemove(index, img)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600"
              >
                <Trash2 size={12} />
              </button>
              {img.file?.source === 'webcam' && (
                 <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-white flex items-center gap-1">
                   <Camera size={8} /> Captured
                 </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center px-1">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            Max {maxSizeMB}MB per image • JPG, PNG, WEBP
          </p>
          <p className="text-[10px] text-slate-400">
             {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <WebcamCapture 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleWebcamCapture}
        captureType={type}
      />
    </div>
  );
};

export default ImageUploadSection;
