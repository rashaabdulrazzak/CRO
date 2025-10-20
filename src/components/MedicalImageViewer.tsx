import React, { useEffect, useRef, useState } from 'react';
import { RenderingEngine, Enums, type StackViewport as CSStackViewport } from '@cornerstonejs/core';
import { init as coreInit } from '@cornerstonejs/core';
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

interface MedicalImageViewerProps {
  imageUrl: string;
  isDicom: boolean;
  width?: string;
  height?: string;
  onImageClick?: () => void;
}

const MedicalImageViewer: React.FC<MedicalImageViewerProps> = ({
  imageUrl,
  isDicom,
  width = '250px',
  height = '400px',
  onImageClick,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const renderingEngineRef = useRef<RenderingEngine | null>(null);
  const isInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupViewer = async () => {
      if (!viewportRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        if (isDicom) {
          await renderDICOMImage();
        } else {
          await renderStandardImage();
        }
      } catch (err: any) {
        console.error('Error setting up viewer:', err);
        if (mounted) {
          setError(err.message || 'Failed to load image');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const renderDICOMImage = async () => {
      if (!viewportRef.current) return;

      try {
        // Initialize Cornerstone if not already initialized
        if (!isInitialized.current) {
          await coreInit();
          cornerstoneDICOMImageLoader.init({
            maxWebWorkers: 1,
          });
          isInitialized.current = true;
          console.log('✓ Cornerstone initialized for DICOM');
        }

        // Generate unique IDs
        const renderingEngineId = `renderingEngine-${Date.now()}-${Math.random()}`;
        const viewportId = `viewport-${Date.now()}-${Math.random()}`;

        // Create rendering engine
        renderingEngineRef.current = new RenderingEngine(renderingEngineId);

        // Configure viewport
        renderingEngineRef.current.enableElement({
          element: viewportRef.current,
          viewportId: viewportId,
          type: Enums.ViewportType.STACK,
          defaultOptions: {
            background: [0, 0, 0] as [number, number, number],
          },
        });

        // Get viewport reference
        const vp = renderingEngineRef.current.getViewport(viewportId) as CSStackViewport;

        // Prepare image ID
        let imageId = imageUrl;
        if (!imageUrl.startsWith('wadouri:')) {
          const fullUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${window.location.origin}${imageUrl}`;
          imageId = `wadouri:${fullUrl}`;
        }

        console.log('Loading DICOM image:', imageId);

        // Set the stack
        await vp.setStack([imageId], 0);

        // Reset camera to fit the image
        vp.resetCamera();

        // Render the viewport
        vp.render();

        console.log('✓ DICOM image rendered successfully');
      } catch (err: any) {
        console.error('DICOM rendering error:', err);
        throw new Error(`DICOM Error: ${err.message || 'Unknown error'}`);
      }
    };

    const renderStandardImage = async () => {
      if (!viewportRef.current) return;

      return new Promise<void>((resolve, reject) => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.backgroundColor = '#000';
        
        img.onload = () => {
          if (viewportRef.current && mounted) {
            viewportRef.current.innerHTML = '';
            viewportRef.current.appendChild(img);
            resolve();
          }
        };

        img.onerror = (err) => {
          console.error('Image load error:', err);
          reject(new Error('Failed to load image'));
        };
      });
    };

    setupViewer();

    // Cleanup
    return () => {
      mounted = false;
      
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy();
          renderingEngineRef.current = null;
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
    };
  }, [imageUrl, isDicom]);

 return (
  <div 
    style={{ width, height, position: 'relative', overflow: 'hidden' }}
    onClick={onImageClick}
    className="cursor-pointer"
  >
    {/* Always render the viewport container (so it has size) */}
    <div
      ref={viewportRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000', // optional: match DICOM bg
      }}
    />

    {/* Overlay loading or error */}
    {isLoading && (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-3xl text-blue-500 mb-2"></i>
          <p className="text-sm text-white">
            Loading {isDicom ? 'DICOM' : 'image'}...
          </p>
        </div>
      </div>
    )}
    
    {error && (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
        <div className="text-center p-4">
          <i className="pi pi-exclamation-triangle text-3xl text-red-500 mb-2"></i>
          <p className="text-sm text-white">{error}</p>
          <p className="text-xs text-gray-300 mt-2 break-all">{imageUrl}</p>
        </div>
      </div>
    )}
  </div>
);
};

export default MedicalImageViewer;