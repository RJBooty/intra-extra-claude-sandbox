import React from 'react';

function AppTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Test App - React is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Debug Information:</h2>
        <p>React Version: {React.version}</p>
        <p>Current Time: {new Date().toLocaleString()}</p>
        <p>Environment: {import.meta.env.MODE}</p>
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not Set'}</p>
      </div>
    </div>
  );
}

export default AppTest;