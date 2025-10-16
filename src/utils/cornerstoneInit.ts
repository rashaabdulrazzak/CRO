import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';

let isInitialized = false;

export async function initCornerstone() {
  if (isInitialized) {
    return true;
  }

  try {
    // Initialize Cornerstone Core
    await cornerstone.init();
    console.log('✓ Cornerstone Core initialized');

    // Initialize Cornerstone Tools
    await cornerstoneTools.init();
    console.log('✓ Cornerstone Tools initialized');

    // Configure DICOM Image Loader - set external dependencies
    // @ts-ignore - external property exists at runtime
    cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
    // @ts-ignore - external property exists at runtime
    cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

    // Get rendering configuration safely
    const renderingConfig = cornerstone.getConfiguration()?.rendering || {};
    
    // Configure DICOM loader with decode settings
    const config: any = {
      useWebWorkers: true,
      decodeConfig: {
        convertFloatPixelDataToInt: false,
        use16BitDataType: Boolean(
          (renderingConfig as any).preferSizeOverAccuracy || 
          (renderingConfig as any).useNorm16Texture
        ),
      },
    };

    cornerstoneDICOMImageLoader.configure(config);

    // Initialize web workers for better performance
    let maxWebWorkers = 1;
    if (navigator.hardwareConcurrency) {
      maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
    }

    const webWorkerConfig = {
      maxWebWorkers,
      startWebWorkersOnDemand: false,
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: false,
          strict: false,
        },
      },
    };

    cornerstoneDICOMImageLoader.webWorkerManager.initialize(webWorkerConfig);
    console.log('✓ DICOM Image Loader initialized with', maxWebWorkers, 'workers');

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Cornerstone:', error);
    isInitialized = false;
    return false;
  }
}

export function getIsInitialized() {
  return isInitialized;
}

export function resetInitialization() {
  isInitialized = false;
}