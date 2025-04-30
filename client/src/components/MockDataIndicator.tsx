import React from 'react';

/**
 * Component to display a visual indicator when using mock data in development mode
 */
const MockDataIndicator: React.FC = () => {
  // Only show the indicator if we're using mock data (controlled by environment variable)
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  
  if (!useMockData) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 120, 0, 0.8)',
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
        <path d="M5 16s-2 0-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5z"></path>
        <path d="M19 10v2a2 2 0 0 1-2 2H5"></path>
        <path d="M15 10 M15 6 M15 14"></path>
      </svg>
      MOCK DATA MODE
    </div>
  );
};

export default MockDataIndicator;
