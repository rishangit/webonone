import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Alert, AlertDescription } from './alert';
import { Upload, X, Loader2 } from 'lucide-react';
import { fileUploadService, FileUploadData } from '../../services/fileUploadService';
import { toast } from 'sonner';
import { formatAvatarUrl } from '../../utils';

interface FileUploadProps {
  onFileUploaded: (filePath: string, fileUrl: string) => void;
  onFileDeleted?: () => void;
  currentImagePath?: string;
  currentImageUrl?: string;
  folderPath: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileDeleted,
  currentImagePath,
  currentImageUrl,
  folderPath,
  label = 'Upload Image',
  accept = 'image/*',
  maxSize = 5, // 5MB default
  className = '',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview URL when currentImageUrl or currentImagePath changes
  useEffect(() => {
    if (currentImageUrl) {
      // If it's already a full URL, use it directly
      if (currentImageUrl.startsWith('http://') || currentImageUrl.startsWith('https://')) {
        setPreviewUrl(currentImageUrl);
      } else {
        // Otherwise, format it using the utility
        setPreviewUrl(formatAvatarUrl(currentImageUrl));
      }
    } else if (currentImagePath) {
      // If only path is provided, format it
      setPreviewUrl(formatAvatarUrl(currentImagePath));
    } else {
      setPreviewUrl(null);
    }
  }, [currentImageUrl, currentImagePath]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      toast.error('Please select an image file');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const response = await fileUploadService.uploadFile(file, folderPath).toPromise();
      
      if (response) {
        setError('');
        // Update preview with the uploaded URL
        setPreviewUrl(response.fileUrl);
        onFileUploaded(response.filePath, response.fileUrl);
        toast.success('Image uploaded successfully!');
      } else {
        setError('Upload failed');
        toast.error('Upload failed');
        // Revert preview on error
        if (currentImageUrl || currentImagePath) {
          setPreviewUrl(currentImageUrl || formatAvatarUrl(currentImagePath));
        } else {
          setPreviewUrl(null);
        }
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      const errorMessage = error.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImagePath && !currentImageUrl) return;

    try {
      // If we have a path, try to delete it
      if (currentImagePath && !currentImagePath.startsWith('http')) {
        await fileUploadService.deleteFile(currentImagePath).toPromise();
      }
      setPreviewUrl(null);
      onFileDeleted?.();
      toast.success('Image deleted successfully!');
    } catch (error: any) {
      console.error('File deletion error:', error);
      const errorMessage = error.message || 'Failed to delete file. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleUploadClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const hasImage = previewUrl || currentImagePath || currentImageUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 border-2 border-dashed border-[var(--glass-border)] hover:border-[var(--accent-border)] transition-colors bg-[var(--glass-bg)]">
        <div className="flex flex-col items-center space-y-4">
          {/* Current Image Preview */}
          {hasImage && previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Current image"
                className="w-32 h-32 object-cover object-center rounded-lg border-2 border-gray-200"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                onError={(e) => {
                  console.error('Image failed to load:', previewUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  setPreviewUrl(null);
                }}
                onLoad={() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Preview image loaded:', previewUrl);
                  }
                }}
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={handleDelete}
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Upload Area */}
          <div className="text-center space-y-2">
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="accent"
                  onClick={handleUploadClick}
                  disabled={disabled || uploading}
                  className="shadow-lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {hasImage ? 'Change Image' : label}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF
                  <br />
                  Maximum size: {maxSize}MB
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default FileUpload;

