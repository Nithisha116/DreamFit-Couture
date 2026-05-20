import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export default function ImageUploader({ value, onChange }) {
  const [preview, setPreview] = useState(value || "");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only .jpeg, .jpg, .png, .webp files are allowed");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB}MB`);
      return false;
    }
    setError("");
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onChange && onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview("");
    onChange && onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {/* Preview Thumbnail */}
        {preview && (
          <div className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm">
            <img
              src={preview}
              alt="Reference"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
            dragActive
              ? "border-violet-500 bg-violet-50"
              : "border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/50"
          }`}
        >
          <Upload size={18} className={dragActive ? "text-violet-500" : "text-slate-400"} />
          <span className={`text-[10px] mt-1 font-medium ${dragActive ? "text-violet-600" : "text-slate-400"}`}>
            Upload
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Accepted formats hint */}
      <p className="text-[10px] text-slate-400">
        only .jpeg, .jpg, .png, .webp allowed
      </p>

      {/* Error message */}
      {error && (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
