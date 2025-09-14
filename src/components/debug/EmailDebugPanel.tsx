import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle, Settings, User, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function EmailDebugPanel() {
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authSettings, setAuthSettings] = useState<any>(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (showPanel) {
      fetchAuthSettings();
    }
  }, [showPanel]);

  const fetchAuthSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      const settings = await response.json();
      setAuthSettings(settings);
    } catch (error) {
      console.error('Failed to fetch auth settings:', error);
    }
  };

  const testSignupEmail = async () => {
    if (!testEmail.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TempPassword123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (error) {
        setEmailLogs(prev => [...prev, {
          type: 'error',
          message: `Signup failed: ${error.message}`,
          timestamp: new Date().toLocaleTimeString(),
          email: testEmail
        }]);
      } else {
        setEmailLogs(prev => [...prev, {
          type: 'success',
          message: data.user?.email_confirmed_at
            ? 'User created and auto-confirmed'
            : 'User created, confirmation email should be sent',
          timestamp: new Date().toLocaleTimeString(),
          email: testEmail,
          user: data.user
        }]);
      }
    } catch (error: any) {
      setEmailLogs(prev => [...prev, {
        type: 'error',
        message: `Network error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        email: testEmail
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testPasswordReset = async () => {
    if (!testEmail.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
        redirectTo: `${window.location.origin}?type=recovery`,
      });

      if (error) {
        setEmailLogs(prev => [...prev, {
          type: 'error',
          message: `Password reset failed: ${error.message}`,
          timestamp: new Date().toLocaleTimeString(),
          email: testEmail
        }]);
      } else {
        setEmailLogs(prev => [...prev, {
          type: 'success',
          message: 'Password reset email sent successfully',
          timestamp: new Date().toLocaleTimeString(),
          email: testEmail
        }]);
      }
    } catch (error: any) {
      setEmailLogs(prev => [...prev, {
        type: 'error',
        message: `Network error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        email: testEmail
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
        title="Email Debug Panel"
      >
        <Mail className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Email Debug Panel</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Auth Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Current Auth Settings
              </h3>

              {authSettings ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Email Auth:</span>
                    <span className={`text-sm ${authSettings.external?.email ? 'text-green-600' : 'text-red-600'}`}>
                      {authSettings.external?.email ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Signup:</span>
                    <span className={`text-sm ${!authSettings.disable_signup ? 'text-green-600' : 'text-red-600'}`}>
                      {!authSettings.disable_signup ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Auto-confirm:</span>
                    <span className={`text-sm ${authSettings.mailer_autoconfirm ? 'text-green-600' : 'text-orange-600'}`}>
                      {authSettings.mailer_autoconfirm ? 'Yes (no emails sent)' : 'No (emails required)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">Loading settings...</p>
                </div>
              )}

              {/* Configuration Tips */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Quick Fixes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• For development: Enable "Auto-confirm" in Supabase Dashboard</li>
                  <li>• For production: Set up SMTP in Authentication → Settings</li>
                  <li>• Check spam folder for confirmation emails</li>
                  <li>• Verify redirect URLs match your domain</li>
                </ul>
              </div>
            </div>

            {/* Email Testing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Test Email Delivery
              </h3>

              <div className="space-y-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <div className="flex space-x-2">
                  <button
                    onClick={testSignupEmail}
                    disabled={isLoading || !testEmail.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Test Signup
                  </button>

                  <button
                    onClick={testPasswordReset}
                    disabled={isLoading || !testEmail.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Test Reset
                  </button>
                </div>
              </div>

              {/* Email Logs */}
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-2">Test Results:</h4>

                {emailLogs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tests run yet</p>
                ) : (
                  <div className="space-y-2">
                    {emailLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-2 text-sm p-2 rounded ${
                          log.type === 'error'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {log.type === 'error' ? (
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{log.message}</div>
                          <div className="text-xs opacity-75">
                            {log.email} at {log.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {emailLogs.length > 0 && (
                  <button
                    onClick={() => setEmailLogs([])}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear logs
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <a
                href="https://supabase.com/dashboard/project/wyixydnywhpiewgsfimc/auth/users"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                View Users
              </a>
              <a
                href="https://supabase.com/dashboard/project/wyixydnywhpiewgsfimc/auth/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Auth Settings
              </a>
              <a
                href="https://supabase.com/dashboard/project/wyixydnywhpiewgsfimc/logs"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                View Logs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}