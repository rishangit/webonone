import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { apiService } from './api';

export interface FileUploadData {
  fileName: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  folderPath: string;
}

export interface FileInfo {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  createdAt: string;
  modifiedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileUploadService {
  private baseUrl = '/uploads';
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks for processing

  /**
   * Compress image to reduce file size and avoid browser freezing
   */
  private async compressImage(file: File, maxWidth: number = 2048, quality: number = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Use requestIdleCallback or setTimeout to avoid blocking
          const processImage = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Calculate new dimensions
              if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
              }

              // Draw image with chunked processing to avoid blocking
              ctx.drawImage(img, 0, 0, width, height);

              // Convert to blob with chunked processing
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Image compression failed'));
                    return;
                  }
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                },
                'image/jpeg',
                quality
              );
            } catch (error) {
              reject(error);
            }
          };

          // Use requestIdleCallback if available, otherwise use setTimeout
          if ('requestIdleCallback' in window) {
            requestIdleCallback(processImage, { timeout: 1000 });
          } else {
            setTimeout(processImage, 0);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload a file to the server with progress tracking
   */
  uploadFile(
    file: File,
    folderPath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Observable<FileUploadData> {
    return new Observable<FileUploadData>((observer) => {
      // Compress image if it's large (async, non-blocking)
      const processAndUpload = async () => {
        try {
          let fileToUpload = file;
          
          // Compress if image is larger than 2MB
          if (file.size > 2 * 1024 * 1024 && file.type.startsWith('image/')) {
            // Process compression in chunks to avoid blocking
            fileToUpload = await this.compressImage(file);
          }

          const formData = new FormData();
          formData.append('file', fileToUpload);

          const xhr = new XMLHttpRequest();
          const url = `${apiService.getBaseURL()}${this.baseUrl}/upload?folderPath=${encodeURIComponent(folderPath)}`;

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100),
              };
              onProgress(progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                observer.next(response.data);
                observer.complete();
              } catch (error) {
                observer.error(new Error('Invalid response format'));
              }
            } else {
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                observer.error(new Error(errorResponse.message || 'Upload failed'));
              } catch {
                observer.error(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener('error', () => {
            observer.error(new Error('Network error during upload'));
          });

          xhr.addEventListener('abort', () => {
            observer.error(new Error('Upload cancelled'));
          });

          xhr.open('POST', url);
          xhr.setRequestHeader('Authorization', `Bearer ${apiService.getAuthToken()}`);
          xhr.send(formData);

          // Return cleanup function
          return () => {
            xhr.abort();
          };
        } catch (error: any) {
          observer.error(error);
        }
      };

      // Use setTimeout to avoid blocking the main thread
      const timeoutId = setTimeout(() => {
        processAndUpload();
      }, 0);

      // Return cleanup function
      return () => {
        clearTimeout(timeoutId);
      };
    });
  }

  /**
   * Delete a file from the server
   */
  deleteFile(filePath: string): Observable<void> {
    return from(apiService.delete<void>(`${this.baseUrl}/delete/${encodeURIComponent(filePath)}`)).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('File deletion error:', error);
        throw error;
      })
    );
  }

  /**
   * Get file information
   */
  getFileInfo(filePath: string): Observable<FileInfo> {
    return from(apiService.get<FileInfo>(`${this.baseUrl}/info/${encodeURIComponent(filePath)}`)).pipe(
      map((response: any) => response.data || response),
      catchError((error) => {
        console.error('Get file info error:', error);
        throw error;
      })
    );
  }
}

export const fileUploadService = new FileUploadService();
