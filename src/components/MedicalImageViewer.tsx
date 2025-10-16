import React, { useEffect, useRef, useState } from 'react';
import { RenderingEngine, Enums } from '@cornerstonejs/core';
import { initCornerstone } from '../utils/cornerstoneInit';

const { ViewportType } = Enums;

interface MedicalImageViewerProps {
  imageUrl: string;
  isDicom?: boolean;
  width?: string;
  height?: string;
  className?: string;
  onImageClick?: () => void;
  viewportId?: string;
}

const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  imageUrl,
  isDicom = false,
  width = '100%',
  height = '120px',
  className = '',
  onImageClick,
  viewportId = `viewport-${Date.now()}-${Math.random()}`,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Cornerstone on component mount
  useEffect(() => {
    const init = async () => {
      const success = await initCornerstone();
      setInitialized(success);
      if (!success) {
        setError('Failed to initialize viewer');
        setLoading(false);
      }
    };

    init();
  }, []);

  // Load image when initialized
  useEffect(() => {
    if (!viewerRef.current || !initialized || !imageUrl) {
      if (!isDicom) setLoading(false);
      return;
    }

    if (!isDicom) {
      setLoading(false);
      return;
    }

    const loadDicomImage = async () => {
      const element = viewerRef.current;
      if (!element) return;

      setLoading(true);
      setError(null);

      try {
        // Clean up previous rendering engine if exists
        if (renderingEngineRef.current) {
          try {
            renderingEngineRef.current.destroy();
          } catch (e) {
            console.warn('Previous rendering engine cleanup:', e);
          }
        }

        // Create new rendering engine
        const renderingEngineId = `renderingEngine-${viewportId}`;
        const renderingEngine = new RenderingEngine(renderingEngineId);
        renderingEngineRef.current = renderingEngine;

        // Create viewport input
        const viewportInput: Types.PublicViewportInput = {
          viewportId: viewportId,
          type: ViewportType.STACK,
          element: element,
          
        };

        // Enable the element
        renderingEngine.enableElement(viewportInput);

        // Get the viewport
        const viewport = renderingEngine.getViewport(viewportId);

        // Format image URL for DICOM loader
        const imageId = imageUrl.startsWith('wadouri:')
          ? imageUrl
          : `wadouri:${imageUrl}`;

        // Load and display the image
        await viewport.setStack([imageId]);
        viewport.render();

        setLoading(false);
      } catch (err) {
        console.error('Error loading DICOM image:', err);
        setError('Failed to load DICOM image');
        setLoading(false);
      }
    };

    loadDicomImage();

    // Cleanup on unmount
    return () => {
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy();
          renderingEngineRef.current = null;
        } catch (err) {
          console.warn('Cleanup error:', err);
        }
      }
    };
  }, [initialized, imageUrl, isDicom, viewportId]);

  // Regular image (not DICOM)
  if (!isDicom) {
    return (
      <div
        className={`relative ${className}`}
        style={{ width, height }}
        onClick={onImageClick}
      >
        <img
          src={imageUrl}
          alt="Medical scan"
          className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError('Failed to load image');
            setLoading(false);
          }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <i className="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-xs text-gray-500">Image unavailable</span>
          </div>
        )}
      </div>
    );
  }

  // DICOM image
  return (
    <div
      className={`relative ${className}`}
      style={{ width, height }}
      onClick={onImageClick}
    >
      <div
        ref={viewerRef}
        className="w-full h-full rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
        style={{ backgroundColor: 'black' }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
          <i className="pi pi-spin pi-spinner text-2xl text-white"></i>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
          <span className="text-xs text-white">{error}</span>
        </div>
      )}
    </div>
  );
};

export default MedicalImageViewer;
