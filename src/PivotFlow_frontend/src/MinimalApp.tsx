import React from 'react';

const MinimalApp: React.FC = () => {
  console.log('MinimalApp is rendering');
  
  return (
    <div style={{ 
      backgroundColor: '#0D0D1A',
      color: 'white',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#6366f1', marginBottom: '20px' }}>
        🚀 PivotFlow - ICP Chain Fusion Platform
      </h1>
      
      <div style={{ 
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #6366f1'
      }}>
        <h2>✅ Application Status</h2>
        <ul>
          <li>✅ React is working</li>
          <li>✅ Styling is applied</li>
          <li>✅ ICP branding visible</li>
          <li>✅ Ready for full application</li>
        </ul>
        
        <p>Time: {new Date().toLocaleString()}</p>
        
        <button 
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
          onClick={() => alert('🎉 PivotFlow is working!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default MinimalApp;
