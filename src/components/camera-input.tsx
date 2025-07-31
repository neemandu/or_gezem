'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
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

// Ref interface for parent components to interact with this component
export interface CameraInputRef {
  uploadPendingImage: () => Promise<boolean>;
  hasPendingImage: () => boolean;
  clearImage: () => void;
}

export const CameraInput = forwardRef<CameraInputRef, CameraInputProps>(
  (
    {
      onImageUploaded,
      onError,
      className,
      disabled = false,
      maxSizeMB = 5,
      quality = 0.8,
    },
    ref
  ) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
      progress: 0,
      status: 'idle',
    });
    const [capturedImage, setCapturedImage] = useState<File | null>(null);
    const [isImageUploaded, setIsImageUploaded] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Get authentication context
    const { user } = useAuth();

    // Check if device supports camera
    const isMobile =
      typeof navigator !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      uploadPendingImage: async () => {
        if (capturedImage && !isImageUploaded) {
          return await handleFileUpload(capturedImage);
        }
        return true; // No pending image or already uploaded
      },
      hasPendingImage: () => {
        return capturedImage !== null && !isImageUploaded;
      },
      clearImage: () => {
        removeImage();
      },
    }));

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

    // Handle file selection from camera or gallery
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
        setIsImageUploaded(false);

        const previewUrl = URL.createObjectURL(compressedFile);
        setPreview(previewUrl);
      },
      [maxSizeMB, onError, compressImage]
    );

    // Upload file to Supabase
    const handleFileUpload = useCallback(
      async (file: File): Promise<boolean> => {
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

          console.log('Upload result:', result);

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
          setIsImageUploaded(true);

          // Handle different response structures
          let publicUrl = result.data.publicUrl;
          let filePath = result.data.filePath;

          // If the response has Key and Id structure (newer Supabase response)
          if ('Key' in result.data && 'Id' in result.data) {
            filePath = (result.data as any).Key;
            // Construct public URL from the Key
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            publicUrl = `${supabaseUrl}/storage/v1/object/public/reports/${filePath}`;
          }

          console.log('Calling onImageUploaded with:', {
            publicUrl,
            filePath,
          });
          onImageUploaded?.(publicUrl, filePath);
          return true;
        } catch (error) {
          console.error('Upload error:', error);
          setUploadProgress({ progress: 0, status: 'error' });
          onError?.(
            error instanceof Error ? error.message : 'שגיאה בהעלאת התמונה'
          );
          return false;
        }
      },
      [onImageUploaded, onError, user, maxSizeMB]
    );

    // Upload the captured/selected image manually (for optional manual upload)
    const uploadCurrentImage = useCallback(async () => {
      if (capturedImage && !isImageUploaded) {
        await handleFileUpload(capturedImage);
      }
    }, [capturedImage, isImageUploaded, handleFileUpload]);

    // Remove image
    const removeImage = useCallback(() => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setPreview(null);
      setCapturedImage(null);
      setIsImageUploaded(false);
      setUploadProgress({ progress: 0, status: 'idle' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = '';
      }
    }, [preview]);

    // Cleanup on unmount
    React.useEffect(() => {
      return () => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      };
    }, [preview]);

    return (
      <div className={cn('space-y-4', className)}>
        {/* Image preview */}
        {preview && (
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
            {isImageUploaded && (
              <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                ✓ הועלה
              </div>
            )}
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
        {!preview && (
          <div className="space-y-2">
            {isMobile && (
              <Button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
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

        {/* Optional manual upload button for captured/selected image */}
        {preview && capturedImage && !isImageUploaded && (
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 text-center">
              התמונה תועלה אוטומטית עם שליחת הדיווח
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={uploadCurrentImage}
              disabled={uploadProgress.status === 'uploading'}
              className="w-full"
              size="sm"
            >
              <Upload className="w-4 h-4 ml-2" />
              העלה עכשיו (אופציונלי)
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

        {/* Show status when image is already uploaded */}
        {preview && capturedImage && isImageUploaded && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 text-center">
              ✓ תמונה הועלתה בהצלחה
            </div>

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

        {/* Hidden file input for gallery selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {/* Hidden file input for camera capture - this will open native camera app on mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }
);

CameraInput.displayName = 'CameraInput';
