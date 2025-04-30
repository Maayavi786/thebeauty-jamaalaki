import React from 'react';

/**
 * Component to display a visual indicator when using Firebase emulators in development mode
 */
const EmulatorIndicator: React.FC = () => {
  // Only show the indicator if we're using emulators (controlled by environment variable)
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  
  if (!useEmulators) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        background: 'rgba(25, 118, 210, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ marginRight: '8px' }}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      FIREBASE EMULATOR
    </div>
  );
};

export default EmulatorIndicator;
