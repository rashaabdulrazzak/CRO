
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initCornerstone, getIsInitialized, registerDICOMImageLoader } from '../utils/cornerstoneInit';

interface CornerstoneContextValue {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

const CornerstoneContext = createContext<CornerstoneContextValue>({
  isInitialized: false,
  isInitializing: false,
  error: null,
});

export const useCornerstone = () => useContext(CornerstoneContext);

interface CornerstoneProviderProps {
  children: React.ReactNode;
}

/**
 * Cornerstone Provider - Initialize once for the entire app
 * Wrap your app with this component:
 * 
 * <CornerstoneProvider>
 *   <App />
 * </CornerstoneProvider>
 */
export const CornerstoneProvider: React.FC<CornerstoneProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(getIsInitialized());
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return;

      try {
        setIsInitializing(true);
        console.log('CornerstoneProvider: Starting initialization...');
        
        await initCornerstone();
        registerDICOMImageLoader();
        
        setIsInitialized(true);
        console.log('CornerstoneProvider: Initialization complete!');
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to initialize Cornerstone';
        setError(errorMsg);
        console.error('CornerstoneProvider: Initialization failed:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  return (
    <CornerstoneContext.Provider value={{ isInitialized, isInitializing, error }}>
      {children}
    </CornerstoneContext.Provider>
  );
};