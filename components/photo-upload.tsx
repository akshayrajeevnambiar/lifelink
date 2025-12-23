"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PhotoUploadProps {
  onUploadComplete: (url: string, publicId: string) => void;
  onRemove: () => void;
  currentPhotoUrl?: string | null;
  disabled?: boolean;
}

export default function PhotoUpload({
  onUploadComplete,
  onRemove,
  currentPhotoUrl,
  disabled = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentPhotoUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Please upload a JPEG, PNG, or WebP image";
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return "Image must be smaller than 2MB";
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clear previous errors
    setError(null);

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Start upload
    await uploadToCloudinary(file);

    // Cleanup object URL
    URL.revokeObjectURL(objectUrl);
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get signature from our API
      const signResponse = await fetch("/api/uploads/donor-photo/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "lifelink/donors" }),
      });

      if (!signResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const signData = await signResponse.json();

      // Add logging HERE (not a new const declaration)
      console.log("Signature data:", signData);

      if (!signData.ok) {
        throw new Error(signData.message || "Failed to get upload signature");
      }

      // Step 2: Upload directly to Cloudinary with signature
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp.toString());
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      console.log("Uploading to Cloudinary:", {
        cloudName: signData.cloudName,
        folder: signData.folder,
        timestamp: signData.timestamp,
      });

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Handle upload completion
      const uploadPromise = new Promise<any>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });
      });

      // Start upload
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`
      );
      xhr.send(formData);

      // Wait for completion
      const uploadResult = await uploadPromise;

      // Notify parent component
      onUploadComplete(uploadResult.secure_url, uploadResult.public_id);

      setProgress(100);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  // Handle remove photo
  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!previewUrl ? (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="photo-upload"
          />

          <label
            htmlFor="photo-upload"
            className={`
              flex flex-col items-center justify-center
              w-full h-48 
              border-2 border-dashed rounded-2xl
              cursor-pointer transition-all
              ${
                disabled || uploading
                  ? "border-slate-700 bg-slate-800/20 cursor-not-allowed"
                  : "border-slate-600 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-500"
              }
            `}
          >
            <div className="flex flex-col items-center justify-center space-y-2 p-6">
              <Upload
                className={`h-10 w-10 ${
                  uploading ? "text-slate-500" : "text-slate-400"
                }`}
              />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  {uploading ? "Uploading..." : "Click to upload photo"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPEG, PNG, or WebP (max 2MB)
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        // Preview Area
        <div className="relative">
          <div className="glass-card p-4 rounded-2xl">
            <div className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-xl">
              <Image
                src={previewUrl}
                alt="Photo preview"
                fill
                className="object-cover"
              />
            </div>

            {/* Remove button */}
            {!uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Uploading...</span>
            <span className="text-slate-300 font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Success */}
      {previewUrl && !uploading && !error && (
        <p className="text-sm text-green-400 flex items-center space-x-2">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full" />
          <span>Photo uploaded successfully</span>
        </p>
      )}
    </div>
  );
}
