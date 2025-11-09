import { useState, useEffect } from 'react';
import { imageAPI } from '../../services/api';
import './ImageGallery.css';

export default function ImageGallery({ refreshTrigger }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  const fetchImages = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await imageAPI.getImages();
      setImages(data);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      await imageAPI.deleteImage(imageId);
      setImages(images.filter(img => img.image_id !== imageId));
      setSelectedImage(null);
      alert('Image deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete image');
    }
  };

  const openModal = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return <div className="gallery-loading">Loading images...</div>;
  }

  if (error) {
    return <div className="gallery-error">{error}</div>;
  }

  if (images.length === 0) {
    return (
      <div className="gallery-empty">
        <p>No images uploaded yet</p>
        <small>Upload your first image above!</small>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <h3>Your Images ({images.length})</h3>
      
      <div className="gallery-grid">
        {images.map((image) => (
          <div key={image.image_id} className="gallery-item">
            <div 
              className="gallery-image-container"
              onClick={() => openModal(image)}
            >
              <img
                src={image.thumbnail_url || image.original_url}
                alt={image.filename}
                className="gallery-thumbnail"
              />
              {!image.processed && (
                <div className="processing-badge">⏳ Processing...</div>
              )}
            </div>
            
            <div className="gallery-item-info">
              <p className="filename">{image.filename}</p>
              <small>
                {new Date(image.upload_date).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size view */}
      {selectedImage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <img
              src={selectedImage.original_url}
              alt={selectedImage.filename}
              className="modal-image"
            />
            
            <div className="modal-info">
              <h4>{selectedImage.filename}</h4>
              <p><strong>Uploaded:</strong> {new Date(selectedImage.upload_date).toLocaleString()}</p>
              {selectedImage.width && selectedImage.height && (
                <p><strong>Size:</strong> {selectedImage.width} × {selectedImage.height} px</p>
              )}
              <p><strong>File Size:</strong> {(selectedImage.size / 1024).toFixed(2)} KB</p>
              
              <div className="modal-actions">
                <a 
                  href={selectedImage.original_url} 
                  download={selectedImage.filename}
                  className="modal-button download"
                >
                  ⬇️ Download
                </a>
                <button
                  className="modal-button delete"
                  onClick={() => handleDelete(selectedImage.image_id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
