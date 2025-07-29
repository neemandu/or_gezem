'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/supabase-old';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface CameraInputProps {
  onImageUploaded?: (imageUrl: string, filePath: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  quality?: number;
}

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

export function CameraInput({
  onImageUploaded,
  onError,
  className,
  disabled = false,
  maxSizeMB = 5,
  quality = 0.8,
}: CameraInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle',
  });
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get authentication context
  const { user } = useAuth();

  // Check if device supports camera
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Compress image file
  const compressImage = useCallback(
    async (file: File): Promise<File> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions
          const maxWidth = 1920;
          const maxHeight = 1080;
          let { width, height } = img;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.src = URL.createObjectURL(file);
      });
    },
    [quality]
  );

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('מצלמה לא נתמכת בדפדפן זה');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      setIsCameraMode(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'לא ניתן לגשת למצלמה. אנא ודא שנתת הרשאה למצלמה.';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'הרשאת מצלמה נדחתה. אנא אפשר גישה למצלמה.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'לא נמצאה מצלמה במכשיר.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'מצלמה לא נתמכת בדפדפן זה.';
        }
      }

      onError?.(errorMessage);
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraMode(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });

          // Compress the captured image
          const compressedFile = await compressImage(file);
          setCapturedImage(compressedFile);

          // Create preview
          const previewUrl = URL.createObjectURL(compressedFile);
          setPreview(previewUrl);

          // Stop camera after capture
          stopCamera();
        }
      },
      'image/jpeg',
      quality
    );
  }, [quality, stopCamera, compressImage]);

  // Handle file selection from gallery
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        onError?.('אנא בחר קובץ תמונה בלבד');
        return;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        onError?.(`גודל הקובץ חייב להיות קטן מ-${maxSizeMB}MB`);
        return;
      }

      // Compress and set preview
      const compressedFile = await compressImage(file);
      setCapturedImage(compressedFile);

      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
    },
    [maxSizeMB, onError, compressImage]
  );

  // Upload file to Supabase
  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        // Check authentication
        if (!user) {
          throw new Error('משתמש לא מחובר. אנא התחבר מחדש.');
        }

        setUploadProgress({ progress: 0, status: 'uploading' });

        // Simulate upload progress
        setUploadProgress({ progress: 30, status: 'uploading' });

        // Create authenticated Supabase client
        const supabase = createClient();

        // Upload to Supabase storage with authenticated client
        const result = await storage.uploadImage(
          'reports',
          file,
          'images',
          supabase
        );

        if (!result.success) {
          // Provide more specific error messages
          let errorMessage = 'שגיאה בהעלאת התמונה';
          if (result.error.code === 'UNAUTHORIZED') {
            errorMessage = 'אין הרשאה להעלות תמונה. אנא התחבר מחדש.';
          } else if (result.error.code === 'FILE_TOO_LARGE') {
            errorMessage = `קובץ גדול מדי. גודל מקסימלי: ${maxSizeMB}MB`;
          } else if (result.error.code === 'INVALID_FILE_TYPE') {
            errorMessage =
              'סוג קובץ לא נתמך. אנא בחר תמונה בפורמט JPG, PNG או WebP';
          } else if (result.error.message) {
            errorMessage = result.error.message;
          }
          throw new Error(errorMessage);
        }

        setUploadProgress({ progress: 100, status: 'success' });
        onImageUploaded?.(result.data.publicUrl, result.data.filePath);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress({ progress: 0, status: 'error' });
        onError?.(
          error instanceof Error ? error.message : 'שגיאה בהעלאת התמונה'
        );
      }
    },
    [onImageUploaded, onError, user, maxSizeMB]
  );

  // Upload the captured/selected image
  const uploadCurrentImage = useCallback(async () => {
    if (capturedImage) {
      await handleFileUpload(capturedImage);
    }
  }, [capturedImage, handleFileUpload]);

  // Remove image
  const removeImage = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setCapturedImage(null);
    setUploadProgress({ progress: 0, status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [preview]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      stopCamera();
    };
  }, [preview, stopCamera]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Camera video */}
      {isCameraMode && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <Button
              type="button"
              size="lg"
              onClick={capturePhoto}
              className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16"
            >
              <Camera className="w-6 h-6" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={stopCamera}
              className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Image preview */}
      {preview && !isCameraMode && (
        <div className="relative">
          <img
            src={preview}
            alt="תצוגה מקדימה"
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={removeImage}
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.status === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            מעלה תמונה... {uploadProgress.progress}%
          </p>
        </div>
      )}

      {/* Action buttons */}
      {!preview && !isCameraMode && (
        <div className="space-y-2">
          {isMobile && (
            <Button
              type="button"
              onClick={startCamera}
              disabled={disabled}
              className="w-full"
              size="lg"
            >
              <Camera className="w-4 h-4 ml-2" />
              צלם תמונה
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full"
            size="lg"
          >
            <Upload className="w-4 h-4 ml-2" />
            העלה תמונה
          </Button>
        </div>
      )}

      {/* Upload button for captured/selected image */}
      {preview && !isCameraMode && capturedImage && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={uploadCurrentImage}
            disabled={uploadProgress.status === 'uploading'}
            className="w-full"
            size="lg"
          >
            <Upload className="w-4 h-4 ml-2" />
            העלה תמונה
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={removeImage}
            className="w-full"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 ml-2" />
            צלם שוב
          </Button>
        </div>
      )}

      {/* Hidden file input - removed capture attribute to open gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
