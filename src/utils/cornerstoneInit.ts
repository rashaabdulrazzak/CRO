import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';

let isInitialized = false;

/**
 * Minimal Cornerstone initialization without DICOM loader
 * Use this if you're having issues with the full version
 */
export async function initCornerstone(): Promise<boolean> {
  if (isInitialized) {
    console.log('Cornerstone already initialized');
    return true;
  }

  try {
    console.log('🚀 Starting Cornerstone initialization (simple mode)...');

    // Initialize Cornerstone Core
    await cornerstone.init();
    console.log('✓ Cornerstone Core initialized');

    // Initialize Cornerstone Tools
    await cornerstoneTools.init();
    console.log('✓ Cornerstone Tools initialized');

    isInitialized = true;
    console.log('✅ Cornerstone initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Cornerstone initialization failed:', error);
    isInitialized = false;
    throw error;
  }
}

export function getIsInitialized(): boolean {
  return isInitialized;
}

export function resetInitialization(): void {
  isInitialized = false;
}

// Dummy function for compatibility
export function registerDICOMImageLoader(): void {
  console.log('DICOM loader registration skipped (simple mode)');
}