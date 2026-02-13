'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  multiple?: boolean;
  currentImage?: string;
}

export default function ImageUpload({ onFileSelect, onFilesSelect, multiple, currentImage }: ImageUploadProps) {
  // Single-file mode state
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  // Multi-file mode state
  const [files, setFiles] = useState<Array<{ url: string; file: File }>>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Single-file handler (backward compatible)
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }, [onFileSelect]);

  // Multi-file handler
  const handleMultipleFiles = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newEntries = imageFiles.map(f => ({ url: URL.createObjectURL(f), file: f }));
    setFiles(prev => {
      const updated = [...prev, ...newEntries];
      onFilesSelect?.(updated.map(e => e.file));
      return updated;
    });
  }, [onFilesSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (multiple) {
      handleMultipleFiles(droppedFiles);
    } else {
      if (droppedFiles[0]) handleFile(droppedFiles[0]);
    }
  }, [multiple, handleFile, handleMultipleFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    if (multiple) {
      handleMultipleFiles(Array.from(selected));
    } else {
      const file = selected[0];
      if (file) handleFile(file);
    }
    // Reset input so the same files can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePreview = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesSelect?.(updated.map(e => e.file));
      return updated;
    });
  };

  // ─── Multi-file mode ───
  if (multiple) {
    return (
      <div className="admin-field">
        <label className="admin-label">360 Photos</label>

        {files.length > 0 && (
          <div className="admin-upload-file-list">
            {files.map((entry, i) => (
              <div key={i} className="admin-upload-file-item">
                <img src={entry.url} alt={`Photo ${i + 1}`} />
                <span className="admin-upload-file-name">Photo {i + 1}</span>
                <button type="button" onClick={() => removeFile(i)}>x</button>
              </div>
            ))}
          </div>
        )}

        <div
          className={`admin-upload-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="admin-upload-icon">+</div>
          <div className="admin-upload-text">
            {files.length > 0 ? 'Add more 360 photos' : 'Drop 360 photos here or click to browse'}
          </div>
          <div className="admin-upload-hint">
            Equirectangular JPEG or PNG, recommended 4096x2048 or larger
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // ─── Single-file mode (backward compatible) ───
  return (
    <div className="admin-field">
      <label className="admin-label">360 Photo</label>

      {preview ? (
        <div className="admin-upload-preview">
          <img src={preview} alt="Preview" />
          <button
            type="button"
            className="admin-upload-preview-remove"
            onClick={removePreview}
          >
            x
          </button>
        </div>
      ) : (
        <div
          className={`admin-upload-zone ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="admin-upload-icon">+</div>
          <div className="admin-upload-text">
            Drop a 360 photo here or click to browse
          </div>
          <div className="admin-upload-hint">
            Equirectangular JPEG or PNG, recommended 4096x2048 or larger
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
