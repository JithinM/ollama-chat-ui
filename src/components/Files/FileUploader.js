import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * File Uploader Component
 * US-006
 * Handles file upload, preview, and management
 */
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
export const FileUploader = ({ onFileUpload, onFileRemove, existingFiles = [], }) => {
    const [files, setFiles] = useState(existingFiles);
    const [isDragging, setIsDragging] = useState(false);
    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles.map((file) => ({
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
    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleRemoveFile = (fileId) => {
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        onFileRemove(fileId);
    };
    const getFileFormat = (fileType) => {
        if (fileType.includes('pdf'))
            return 'pdf';
        if (fileType.includes('json'))
            return 'json';
        if (fileType.includes('csv'))
            return 'csv';
        if (fileType.includes('xml'))
            return 'code';
        if (fileType.includes('markdown') || fileType.includes('plain'))
            return 'md';
        return 'txt';
    };
    const getFileIcon = (format) => {
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
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return `${bytes} B`;
        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { ...getRootProps(), className: `border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400'}`, children: [_jsx("input", { ...getInputProps() }), _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4", children: _jsx("svg", { className: "w-8 h-8 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A4 4 0 1115.89 3.903M12 16l7-3.903V16M12 16V8m0 0L5 12.097M12 8L19 12.097" }) }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-2", children: isDragging ? 'Drop files here' : 'Drag & Drop Files' }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Support for PDF, JSON, CSV, Markdown, and text files" }), _jsx("div", { className: "flex flex-wrap justify-center gap-2", children: ['PDF', 'JSON', 'CSV', 'MD', 'TXT'].map((format) => (_jsx("span", { className: "px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs", children: format }, format))) })] })] }), files.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: ["Attached Files (", files.length, ")"] }), _jsx("div", { className: "space-y-3", children: files.map((file) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-2xl", children: getFileIcon(file.format) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-800", children: file.name }), _jsxs("p", { className: "text-sm text-gray-600", children: [formatFileSize(file.size), " \u2022 ", file.format.toUpperCase()] })] })] }), _jsx("button", { onClick: () => handleRemoveFile(file.id), className: "p-2 text-gray-400 hover:text-red-500 transition-colors", title: "Remove file", children: _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }, file.id))) })] }))] }));
};
export default FileUploader;
