import { Observable, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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

class FileUploadService {
  private baseUrl = '/uploads';

  /**
   * Upload a file to the server
   */
  uploadFile(file: File, folderPath: string): Observable<FileUploadData> {
    const formData = new FormData();
    formData.append('file', file);

    return from(
      fetch(`${apiService.getBaseURL()}${this.baseUrl}/upload?folderPath=${encodeURIComponent(folderPath)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiService.getAuthToken()}`,
        },
        body: formData,
      })
    ).pipe(
      switchMap(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }
        const data = await response.json();
        return data.data;
      }),
      catchError((error) => {
        console.error('File upload error:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a file from the server
   */
  deleteFile(filePath: string): Observable<void> {
    return apiService.delete<void>(`${this.baseUrl}/delete/${encodeURIComponent(filePath)}`).pipe(
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
    return apiService.get<FileInfo>(`${this.baseUrl}/info/${encodeURIComponent(filePath)}`).pipe(
      map((response) => response.data),
      catchError((error) => {
        console.error('Get file info error:', error);
        throw error;
      })
    );
  }
}

export const fileUploadService = new FileUploadService();
