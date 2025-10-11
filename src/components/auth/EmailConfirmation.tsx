import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { auth } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface EmailConfirmationProps {
  onConfirmed: () => void;
  onError: () => void;
}

export function EmailConfirmation({ onConfirmed, onError }: EmailConfirmationProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the tokens from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        console.log('Email confirmation params:', { token, type, accessToken, refreshToken });

        if (type === 'signup' && token) {
          // This is an email confirmation
          const { data, error } = await auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to confirm email address');
            toast.error('Email confirmation failed');
            setTimeout(() => onError(), 2000);
            return;
          }

          if (data?.user) {
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to login...');
            toast.success('Email confirmed! You can now log in.');

            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            setTimeout(() => onConfirmed(), 2000);
          }
        } else if (accessToken && refreshToken) {
          // This might be a session from email link
          const { error } = await auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage('Invalid or expired confirmation link');
            setTimeout(() => onError(), 2000);
            return;
          }

          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting...');
          toast.success('Email confirmed! Welcome to IntraExtra.');
          setTimeout(() => onConfirmed(), 1000);
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email for the correct link.');
          setTimeout(() => onError(), 3000);
        }
      } catch (error: any) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during email confirmation');
        toast.error('Email confirmation failed');
        setTimeout(() => onError(), 2000);
      }
    };

    confirmEmail();
  }, [onConfirmed, onError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IntraExtra</h1>
          <p className="text-gray-600">CASFID International Platform</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
              {status === 'verifying' && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'verifying' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </h2>

            <p className="text-gray-600 mb-6">{message}</p>

            {status === 'error' && (
              <div className="space-y-3 w-full">
                <button
                  onClick={onError}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Login
                </button>

                <div className="text-sm text-gray-500">
                  Need help? Contact{' '}
                  <a href="mailto:support@casfid.com" className="text-blue-600 hover:text-blue-500">
                    support@casfid.com
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}