import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

export function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [error, setError] = useState<string>('');
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: '',
    anonKey: ''
  });

  useEffect(() => {
    // Get config from environment
    setSupabaseConfig({
      url: import.meta.env.VITE_SUPABASE_URL || 'Not configured',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured (hidden)' : 'Not configured'
    });

    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');

      // Test basic connectivity
      const { data, error } = await supabase.from('auth.users').select('count').limit(1);

      if (error) {
        console.error('Supabase connection error:', error);
        setError(`Connection failed: ${error.message}`);
        setConnectionStatus('failed');
      } else {
        setConnectionStatus('connected');
        setError('');
      }
    } catch (err: any) {
      console.error('Network error:', err);
      setError(`Network error: ${err.message}`);
      setConnectionStatus('failed');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'connected':
        return 'Connected successfully';
      case 'failed':
        return 'Connection failed';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          {connectionStatus === 'connected' ? (
            <Wifi className="w-6 h-6 text-green-600" />
          ) : (
            <WifiOff className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Supabase Connection</h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm ${
              connectionStatus === 'connected' ? 'text-green-600' :
              connectionStatus === 'failed' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supabase URL</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded font-mono break-all">
            {supabaseConfig.url}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Anonymous Key</label>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
            {supabaseConfig.anonKey}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <button
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
        >
          Test Connection Again
        </button>
      </div>

      {connectionStatus === 'failed' && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Check your Supabase project status in the dashboard</li>
            <li>• Verify the VITE_SUPABASE_URL is correct</li>
            <li>• Ensure your project isn't paused</li>
            <li>• Check your internet connection</li>
            <li>• Verify your environment variables are loaded</li>
          </ul>
        </div>
      )}
    </div>
  );
}