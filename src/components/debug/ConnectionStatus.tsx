import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ConnectionStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [projectUrl, setProjectUrl] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setProjectUrl(import.meta.env.VITE_SUPABASE_URL || 'Not configured');

    try {
      const { data, error } = await supabase.from('auth.users').select('count').limit(1);

      if (error) {
        setStatus('error');
      } else {
        setStatus('connected');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'error': return 'Connection Error';
      default: return 'Checking...';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 border z-40">
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <div>
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
          <div className="text-xs text-gray-500 max-w-48 truncate">
            {projectUrl}
          </div>
        </div>
      </div>

      {status === 'error' && (
        <div className="mt-2">
          <button
            onClick={checkConnection}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}