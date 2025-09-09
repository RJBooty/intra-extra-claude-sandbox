import React from 'react';

export default function App() {
  console.log('Debug App component is rendering');
  
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Debug App Working!</h1>
        <p className="text-blue-700">If you see this, React is working</p>
        <p className="text-blue-600 mt-2">Check browser console for logs</p>
      </div>
    </div>
  );
}