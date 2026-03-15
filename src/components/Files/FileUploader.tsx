/**
 * File Uploader Component
 * US-006
 * Handles file upload, preview, and management
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileMetadata, FileFormat } from '@/types';

interface FileUploaderProps {
  onFileUpload: (files: FileMetadata[]) => void;
  onFileRemove: (fileId: string) => void;
  existingFiles?: FileMetadata[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onFileRemove,
  existingFiles = [],
}) => {
  const [files, setFiles] = useState<FileMetadata[]>(existingFiles);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileMetadata[] = acceptedFiles.map((file) => ({
      id: `file-${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
      format: getFileFormat(file.type),
      content: undefined,
      isUploaded: true,
      uploadDate: new Date(),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    onFileUpload(newFiles);
  }, [onFileUpload]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
    onFileRemove(fileId);
  };

  const getFileFormat = (fileType: string): FileFormat => {
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('json')) return 'json';
    if (fileType.includes('csv')) return 'csv';
    if (fileType.includes('xml')) return 'code';
    if (fileType.includes('markdown') || fileType.includes('plain')) return 'md';
    return 'txt';
  };

  const getFileIcon = (format: string): string => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'json':
        return '📋';
      case 'csv':
        return '📊';
      case 'code':
        return '💻';
      case 'md':
        return '📝';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragOver,
    onDragLeave,
    accept: {
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md', '.txt'],
      'text/plain': ['.txt'],
    },
    maxFiles: 10,
  });

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A4 4 0 1115.89 3.903M12 16l7-3.903V16M12 16V8m0 0L5 12.097M12 8L19 12.097"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isDragging ? 'Drop files here' : 'Drag & Drop Files'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Support for PDF, JSON, CSV, Markdown, and text files
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['PDF', 'JSON', 'CSV', 'MD', 'TXT'].map((format) => (
              <span
                key={format}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Attached Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.format)}</span>
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.size)} • {file.format.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove file"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
