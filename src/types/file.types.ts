/**
 * File-related type definitions
 * US-006
 */

import type { SearchResult } from './model.types';

export type FileFormat = 'pdf' | 'txt' | 'md' | 'json' | 'csv' | 'code';

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  format: FileFormat;
  content?: string;
  isUploaded: boolean;
  uploadDate?: Date;
  metadata?: Record<string, unknown>;
}

export interface FileUploadOptions {
  acceptedFormats: string[];
  maxFileSize: number;
  multipleFiles: boolean;
}

export interface FileUploadResult {
  file: FileMetadata;
  success: boolean;
  error?: string;
}

export interface FileService {
  uploadFile: (
    file: File,
    options?: FileUploadOptions
  ) => Promise<FileUploadResult>;
  getFiles: () => Promise<FileMetadata[]>;
  removeFile: (fileId: string) => Promise<void>;
  getFileContent: (fileId: string) => Promise<string>;
}

export interface FilePreviewProps {
  file: FileMetadata;
  onClose: () => void;
}

export interface FileUploaderState {
  files: FileMetadata[];
  isDragging: boolean;
  uploadProgress: Map<string, number>;
  error: Error | null;
}
