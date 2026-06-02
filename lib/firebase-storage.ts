import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './firebase-client';

const storage = getStorage(app);

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  downloadURL?: string;
  error?: string;
}

/**
 * Upload file to Firebase Storage
 * @param file - File to upload
 * @param path - Storage path (e.g., 'purchase-orders/po-123/file.pdf')
 * @param onProgress - Callback for upload progress
 * @returns Promise with download URL
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          status: 'uploading',
        });
      },
      (error) => {
        onProgress?.({
          progress: 0,
          status: 'error',
          error: error.message,
        });
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress?.({
          progress: 100,
          status: 'success',
          downloadURL,
        });
        resolve(downloadURL);
      }
    );
  });
}

/**
 * Delete file from Firebase Storage
 * @param path - Storage path to delete
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const extension = getFileExtension(file.name);
  return allowedTypes.includes(extension);
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
