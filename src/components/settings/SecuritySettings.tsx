import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Clock, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { userService } from '../../lib/services/userService';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface SecuritySettingsProps {
  onBack: () => void;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'boolean' | 'string' | 'number' | 'object';
  description: string;
  category: string;
  is_system: boolean;
  requires_restart: boolean;
}

interface SecuritySettings {
  email_verification_enabled: boolean;
  password_reset_enabled: boolean;
  session_timeout_minutes: number;
  max_failed_login_attempts: number;
  lockout_duration_minutes: number;
  require_strong_passwords: boolean;
  two_factor_available: boolean;
  audit_log_retention_days: number;
}

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMaster, setIsMaster] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    email_verification_enabled: false,
    password_reset_enabled: true,
    session_timeout_minutes: 480,
    max_failed_login_attempts: 5,
    lockout_duration_minutes: 30,
    require_strong_passwords: true,
    two_factor_available: false,
    audit_log_retention_days: 90,
  });
  const [databaseConfigured, setDatabaseConfigured] = useState(true);

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      setLoading(true);

      // Get current user and check if they're a master
      const userWithRole = await userService.getCurrentUserWithRole();
      if (!userWithRole) {
        toast.error('Unable to load user information');
        onBack();
        return;
      }

      setCurrentUser(userWithRole);
      const userIsMaster = userWithRole.role?.role_type === 'Master';
      setIsMaster(userIsMaster);

      if (!userIsMaster) {
        toast.error('Access denied. Only Master users can access security settings.');
        onBack();
        return;
      }

      // Load system settings
      await loadSettings();
    } catch (error) {
      console.error('Failed to load user and settings:', error);
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      console.log('🔍 Loading settings from database...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'security');

      if (error) {
        console.error('❌ Error loading settings:', error);
        console.log('🔍 Error code:', error.code);
        console.log('🔍 Error message:', error.message);

        // If table doesn't exist, use localStorage fallback for testing
        if (error.code === 'PGRST205' || error.message?.includes('system_settings')) {
          console.log('📝 system_settings table not found, activating test mode');
          setDatabaseConfigured(false);

          // Load settings from localStorage for testing
          const savedSettings = localStorage.getItem('security_settings_test');
          if (savedSettings) {
            try {
              const parsed = JSON.parse(savedSettings);
              setSettings(prev => ({ ...prev, ...parsed }));
              console.log('✅ Loaded settings from localStorage:', parsed);
            } catch (e) {
              console.error('❌ Failed to parse localStorage settings');
            }
          } else {
            console.log('📝 No localStorage settings found, using defaults');
          }
          return;
        }
        return;
      }

      console.log('✅ Database query successful. Data received:', data);
      console.log('📊 Number of settings found:', data?.length || 0);

      if (data && data.length > 0) {
        const settingsMap: Partial<SecuritySettings> = {};
        data.forEach((setting: SystemSetting) => {
          const key = setting.setting_key as keyof SecuritySettings;
          let value: any = setting.setting_value;

          // Parse the JSON value
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // If parsing fails, use the string value
            }
          }

          // Convert to appropriate type
          if (setting.setting_type === 'boolean') {
            settingsMap[key] = value === true || value === 'true';
          } else if (setting.setting_type === 'number') {
            settingsMap[key] = parseInt(value) || 0;
          } else {
            settingsMap[key] = value;
          }
        });

        console.log('📝 Parsed settings from database:', settingsMap);
        setSettings(prev => ({ ...prev, ...settingsMap }));
      } else {
        console.log('📝 No settings found in database, table exists but is empty');
        // Table exists but is empty - this is still a valid database configuration
        console.log('💾 Database is properly configured but empty');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load security settings');
    }
  };

  const handleSettingChange = (key: keyof SecuritySettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!currentUser?.id || !isMaster) {
      toast.error('Unauthorized to save settings');
      return;
    }

    try {
      setSaving(true);

      // If database is not configured, save to localStorage for testing
      if (!databaseConfigured) {
        localStorage.setItem('security_settings_test', JSON.stringify(settings));
        console.log('Settings saved to localStorage for testing:', settings);
        toast.success('Settings saved (test mode - using localStorage)');

        // Show info about email verification change
        if (settings.email_verification_enabled) {
          toast('Email verification is now ENABLED (test mode)', {
            duration: 4000,
            icon: '✅'
          });
        } else {
          toast('Email verification is now DISABLED (test mode)', {
            duration: 4000,
            icon: '❌'
          });
        }

        setSaving(false);
        return;
      }

      // Update each setting in database
      const settingUpdates = Object.entries(settings).map(([key, value]) => {
        return supabase.rpc('update_system_setting', {
          key_name: key,
          new_value: JSON.stringify(value),
          user_id: currentUser.id
        });
      });

      const results = await Promise.all(settingUpdates);

      // Check for any failures
      const failures = results.filter(result => result.error);
      if (failures.length > 0) {
        console.error('Some settings failed to update:', failures);
        // If function doesn't exist, show appropriate message
        const hasTableError = failures.some(f => f.error?.message?.includes('system_settings') || f.error?.code === 'PGRST205');
        if (hasTableError) {
          toast.error('Database not fully configured. Please contact your system administrator.');
        } else {
          toast.error('Some settings failed to update');
        }
        return;
      }

      toast.success('Security settings updated successfully');

      // Show restart warning for certain settings
      if (settings.email_verification_enabled !== false) {
        toast('Note: Email verification changes may require application restart to take full effect', {
          duration: 5000,
          icon: '⚠️'
        });
      }

    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading security settings...</span>
      </div>
    );
  }

  if (!isMaster) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">Only Master users can access security settings.</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Back to Settings
        </button>
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
            <p className="text-gray-600">Configure security and authentication settings for the platform</p>
          </div>
        </div>
      </div>

      {!databaseConfigured && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Test Mode Active</h4>
              <p className="mt-1 text-sm text-blue-800">
                The system_settings table is not configured, so settings are saved to localStorage for testing.
                Toggle functionality works but won't persist after browser refresh until database is set up.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Authentication Settings</h2>
          <p className="text-sm text-gray-600">Control how users authenticate and register</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Verification Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Email Verification</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Require new users to verify their email address before they can sign in
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Currently: {settings.email_verification_enabled ? 'Enabled' : 'Disabled (Test Mode)'}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_verification_enabled}
                onChange={(e) => handleSettingChange('email_verification_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Password Reset */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Password Reset</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Allow users to reset their passwords via email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.password_reset_enabled}
                onChange={(e) => handleSettingChange('password_reset_enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Strong Passwords */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Strong Password Requirements</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Enforce strong password requirements for all users
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.require_strong_passwords}
                onChange={(e) => handleSettingChange('require_strong_passwords', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Session & Security */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Session & Security</h2>
          <p className="text-sm text-gray-600">Configure session timeouts and security policies</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Session Timeout */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Session Timeout</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automatic logout after inactivity (in minutes)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="30"
                max="1440"
                value={settings.session_timeout_minutes}
                onChange={(e) => handleSettingChange('session_timeout_minutes', parseInt(e.target.value) || 480)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-sm text-gray-500">min</span>
            </div>
          </div>

          {/* Max Failed Attempts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Max Failed Login Attempts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Number of failed attempts before account lockout
                </p>
              </div>
            </div>
            <input
              type="number"
              min="3"
              max="20"
              value={settings.max_failed_login_attempts}
              onChange={(e) => handleSettingChange('max_failed_login_attempts', parseInt(e.target.value) || 5)}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
            />
          </div>

          {/* Lockout Duration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Lockout Duration</h3>
                <p className="text-sm text-gray-600 mt-1">
                  How long accounts remain locked (in minutes)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                max="1440"
                value={settings.lockout_duration_minutes}
                onChange={(e) => handleSettingChange('lockout_duration_minutes', parseInt(e.target.value) || 30)}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center"
              />
              <span className="text-sm text-gray-500">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Security Best Practices</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Enable email verification for production environments</li>
              <li>• Use strong password requirements to improve security</li>
              <li>• Set appropriate session timeouts based on your security needs</li>
              <li>• Monitor failed login attempts to detect potential attacks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}