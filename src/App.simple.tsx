import React, { useState, useEffect } from 'react';

function AppSimple() {
  const [debugInfo, setDebugInfo] = useState('Starting app...');

  useEffect(() => {
    console.log('🔍 Debug App started');
    setDebugInfo('App component mounted');

    // Test if we can import supabase
    const testImports = async () => {
      try {
        console.log('🔍 Testing imports...');
        setDebugInfo('Testing imports...');
        
        const { auth } = await import('./lib/supabase');
        console.log('🔍 Supabase imported successfully:', auth);
        setDebugInfo('Supabase imported successfully');

        // Test auth check
        console.log('🔍 Testing auth...');
        setDebugInfo('Testing auth...');
        
        const currentUser = await auth.getCurrentUser();
        console.log('🔍 Auth check result:', currentUser);
        setDebugInfo(`Auth check complete: ${currentUser ? 'User found' : 'No user'}`);

      } catch (error) {
        console.error('🔍 Debug error:', error);
        setDebugInfo(`Error: ${error.message}`);
      }
    };

    testImports();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'blue' }}>🔍 Debug Mode</h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        border: '1px solid #ccc',
        marginTop: '10px'
      }}>
        <h2>Status:</h2>
        <p>{debugInfo}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => window.location.href = 'http://localhost:5174'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try Port 5174
        </button>
      </div>
    </div>
  );
}

export default AppSimple;