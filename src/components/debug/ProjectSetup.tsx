import React, { useState } from 'react';
import { Clipboard, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ProjectSetup() {
  const [projectUrl, setProjectUrl] = useState('https://wyixydnywhpiewgsfimc.supabase.co');
  const [anonKey, setAnonKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const testConnection = async () => {
    if (!anonKey.trim()) {
      setErrorMessage('Please enter your anon key');
      return;
    }

    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // Test the connection with provided credentials
      const response = await fetch(`${projectUrl}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });

      if (response.ok) {
        setConnectionStatus('success');
        // Show the .env content to copy
        const envContent = `VITE_SUPABASE_URL=${projectUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}`;

        navigator.clipboard.writeText(envContent);
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        setConnectionStatus('error');
        setErrorMessage(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Network error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect to Your Supabase Project</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project URL
            </label>
            <input
              type="text"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://your-project.supabase.co"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anon/Public Key
            </label>
            <textarea
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 font-mono text-sm"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Get this from your Supabase Dashboard → Settings → API
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          )}

          {connectionStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Connection Successful!</span>
              </div>
              <p className="text-green-700 text-sm mb-3">
                Environment variables have been copied to your clipboard. Replace your .env file content with:
              </p>
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-white relative">
                <pre>{`VITE_SUPABASE_URL=${projectUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}`}</pre>
                <button
                  onClick={() => copyToClipboard(`VITE_SUPABASE_URL=${projectUrl}\nVITE_SUPABASE_ANON_KEY=${anonKey}`)}
                  className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
              <p className="text-green-700 text-sm mt-2">
                After updating .env, refresh your browser to apply the changes.
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Refresh Now
                </button>
                <button
                  onClick={() => setConnectionStatus('idle')}
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                >
                  Test Again
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'testing'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {connectionStatus === 'testing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing Connection...
                </>
              ) : (
                'Test Connection'
              )}
            </button>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Step-by-step setup:</h4>
              <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                <li>
                  <strong>Get API credentials:</strong>
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                    <li>Go to <a href="https://supabase.com/dashboard/project/wyixydnywhpiewgsfimc" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">your Supabase dashboard</a></li>
                    <li>Click "Settings" → "API"</li>
                    <li>Copy the URL and anon key</li>
                  </ul>
                </li>
                <li>
                  <strong>Test connection:</strong> Paste credentials above and click "Test Connection"
                </li>
                <li>
                  <strong>Update environment:</strong> Copy the generated .env content to your .env file
                </li>
                <li>
                  <strong>Configure auth settings:</strong>
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                    <li>Go to Authentication → Settings</li>
                    <li>Set Site URL to: <code className="bg-gray-200 px-1 rounded">http://localhost:5173</code></li>
                    <li>Add Redirect URL: <code className="bg-gray-200 px-1 rounded">http://localhost:5173</code></li>
                    <li>Enable "Confirm email" if desired</li>
                  </ul>
                </li>
                <li>
                  <strong>Test password reset:</strong> Refresh browser and try "Forgot password?"
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}