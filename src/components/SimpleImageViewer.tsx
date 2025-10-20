import React, { useState } from 'react';

interface SimpleImageViewerProps {
  imageUrl: string;
  width?: string;
  height?: string;
  onImageClick?: () => void;
}

/**
 * Simple image viewer without Cornerstone dependencies
 * Use this as a fallback or for non-DICOM images
 */
const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({
  imageUrl,
  width = '100%',
  height = '400px',
  onImageClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load image');
    console.error('Image load error:', imageUrl);
  };

  return (
    <div 
      style={{ width, height, position: 'relative', backgroundColor: '#f3f4f6' }}
      onClick={onImageClick}
      className="cursor-pointer rounded-lg overflow-hidden"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <i className="pi pi-spin pi-spinner text-3xl text-blue-500 mb-2"></i>
            <p className="text-sm text-gray-600">Loading image...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <i className="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-gray-500 mt-2 break-all">{imageUrl}</p>
          </div>
        </div>
      )}
      
      <img
        src={imageUrl}
        alt="Medical image"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: isLoading || error ? 'none' : 'block',
          backgroundColor: '#000',
        }}
      />
    </div>
  );
};

export default SimpleImageViewer;