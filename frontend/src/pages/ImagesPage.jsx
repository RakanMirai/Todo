import { useState } from 'react';
import ImageUpload from '../components/Images/ImageUpload';
import ImageGallery from '../components/Images/ImageGallery';
import './ImagesPage.css';

export default function ImagesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger gallery refresh
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="images-page">
      <div className="images-header">
        <h1>📷 Image Gallery</h1>
        <p>Upload and manage your images with automatic thumbnail generation</p>
      </div>

      <ImageUpload onUploadSuccess={handleUploadSuccess} />
      
      <ImageGallery refreshTrigger={refreshTrigger} />
    </div>
  );
}
