import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ 
      color: 'white', 
      background: '#0D0D1A', 
      minHeight: '100vh', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🚀 PivotFlow Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default TestApp;
