import { useState } from 'react';
import { imageAPI } from '../../services/api';
import './ImageUpload.css';

export default function ImageUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setError('');
    setFile(selectedFile);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await imageAPI.uploadImage(formData);
      
      // Reset form
      setFile(null);
      setPreview(null);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
      
      alert(`✓ ${response.message}`);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError('');
  };

  return (
    <div className="image-upload">
      <h3>Upload Image</h3>
      
      <div className="upload-area">
        {!preview ? (
          <label className="file-input-label">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <div className="upload-placeholder">
              <span className="upload-icon">📷</span>
              <p>Click to select an image</p>
              <small>JPEG, PNG, GIF, WebP • Max 10MB</small>
            </div>
          </label>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <div className="preview-actions">
              <button onClick={handleClear} disabled={uploading}>
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {file && (
        <div className="file-info">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      <button
        className="upload-button"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? '⏳ Uploading...' : '⬆️ Upload'}
      </button>
    </div>
  );
}
