'use client';

import { useState, useRef } from 'react';
import { uploadFile, validateFileType, validateFileSize, formatFileSize, UploadProgress } from '@/lib/firebase-storage';

interface FileUploadProps {
  label: string;
  accept?: string;
  allowedExtensions?: string[];
  maxSizeMB?: number;
  storagePath: string;
  onUploadComplete: (downloadURL: string, fileName: string, fileSize: number) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  required?: boolean;
  currentFileURL?: string;
  currentFileName?: string;
}

export function FileUpload({
  label,
  accept = '*',
  allowedExtensions = [],
  maxSizeMB = 10,
  storagePath,
  onUploadComplete,
  onUploadError,
  disabled = false,
  required = false,
  currentFileURL,
  currentFileName,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (allowedExtensions.length > 0 && !validateFileType(file, allowedExtensions)) {
      const errorMsg = `Invalid file type. Allowed: ${allowedExtensions.join(', ').toUpperCase()}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validate file size
    if (!validateFileSize(file, maxSizeMB)) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    setUploadProgress({ progress: 0, status: 'uploading' });

    try {
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const fullPath = `${storagePath}/${fileName}`;

      const downloadURL = await uploadFile(selectedFile, fullPath, (progress) => {
        setUploadProgress(progress);
      });

      onUploadComplete(downloadURL, selectedFile.name, selectedFile.size);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      setUploadProgress(null);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = uploadProgress?.status === 'uploading';

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Current file display */}
      {currentFileURL && !selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-blue-900">{currentFileName || 'Current file'}</span>
            </div>
            <a
              href={currentFileURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View
            </a>
          </div>
        </div>
      )}

      {/* File input */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* File info and upload button */}
      {selectedFile && !isUploading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Uploading...</span>
            <span className="text-sm text-blue-700">{Math.round(uploadProgress.progress)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success message */}
      {uploadProgress?.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-900">File uploaded successfully!</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-gray-500">
        {allowedExtensions.length > 0 && `Allowed: ${allowedExtensions.join(', ').toUpperCase()}. `}
        Max size: {maxSizeMB}MB
      </p>
    </div>
  );
}
