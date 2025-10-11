import { supabase } from '../supabase';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'boolean' | 'string' | 'number' | 'object';
  description: string;
  category: string;
  is_system: boolean;
  requires_restart: boolean;
}

class SystemSettingsService {
  async getSettings(category?: string): Promise<SystemSetting[]> {
    try {
      let query = supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching system settings:', error);
        return [];
      }

      return (data || []).map(setting => ({
        ...setting,
        setting_value: this.parseSettingValue(setting.setting_value, setting.setting_type)
      }));
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      return [];
    }
  }

  async getSetting(key: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value, setting_type')
        .eq('setting_key', key)
        .single();

      if (error) {
        console.error('Error fetching system setting:', error);
        return null;
      }

      return this.parseSettingValue(data.setting_value, data.setting_type);
    } catch (error) {
      console.error('Failed to fetch system setting:', error);
      return null;
    }
  }

  async updateSetting(key: string, value: any, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('update_system_setting', {
        key_name: key,
        new_value: JSON.stringify(value),
        user_id: userId
      });

      if (error) {
        console.error('Error updating system setting:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update system setting:', error);
      return false;
    }
  }

  async updateMultipleSettings(updates: Record<string, any>, userId: string): Promise<boolean> {
    try {
      const promises = Object.entries(updates).map(([key, value]) =>
        this.updateSetting(key, value, userId)
      );

      const results = await Promise.all(promises);
      return results.every(result => result === true);
    } catch (error) {
      console.error('Failed to update multiple settings:', error);
      return false;
    }
  }

  private parseSettingValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    // If it's already parsed (object), return as is
    if (typeof value === 'object' && type === 'object') {
      return value;
    }

    // If it's a string, try to parse it
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);

        switch (type) {
          case 'boolean':
            return Boolean(parsed);
          case 'number':
            return Number(parsed) || 0;
          case 'object':
            return parsed;
          default:
            return parsed;
        }
      } catch {
        // If parsing fails, return the raw string
        switch (type) {
          case 'boolean':
            return value === 'true' || value === true;
          case 'number':
            return Number(value) || 0;
          default:
            return value;
        }
      }
    }

    return value;
  }

  // Email verification specific methods
  async isEmailVerificationEnabled(): Promise<boolean> {
    try {
      const setting = await this.getSetting('email_verification_enabled');
      return setting === true;
    } catch (error) {
      // Fallback to localStorage for testing if database table doesn't exist
      console.log('Database unavailable, checking localStorage for email verification setting');
      const testSettings = localStorage.getItem('security_settings_test');
      if (testSettings) {
        try {
          const parsed = JSON.parse(testSettings);
          const enabled = parsed.email_verification_enabled === true;
          console.log('📧 Email verification from localStorage:', enabled);
          return enabled;
        } catch (e) {
          console.error('Failed to parse test settings from localStorage');
        }
      }

      // Default to false (disabled) for test mode
      console.log('📧 Using default email verification: false (test mode)');
      return false;
    }
  }

  async setEmailVerificationEnabled(enabled: boolean, userId: string): Promise<boolean> {
    return await this.updateSetting('email_verification_enabled', enabled, userId);
  }

  // Password reset specific methods
  async isPasswordResetEnabled(): Promise<boolean> {
    const setting = await this.getSetting('password_reset_enabled');
    return setting !== false; // Default to true if not set
  }

  async setPasswordResetEnabled(enabled: boolean, userId: string): Promise<boolean> {
    return await this.updateSetting('password_reset_enabled', enabled, userId);
  }

  // Session timeout methods
  async getSessionTimeout(): Promise<number> {
    const setting = await this.getSetting('session_timeout_minutes');
    return setting || 480; // Default 8 hours
  }

  async setSessionTimeout(minutes: number, userId: string): Promise<boolean> {
    return await this.updateSetting('session_timeout_minutes', minutes, userId);
  }

  // Security settings as a group
  async getSecuritySettings(): Promise<Record<string, any>> {
    try {
      const settings = await this.getSettings('security');
      const result: Record<string, any> = {};

      settings.forEach(setting => {
        result[setting.setting_key] = setting.setting_value;
      });

      // Set defaults for missing settings
      return {
        email_verification_enabled: false,
        password_reset_enabled: true,
        session_timeout_minutes: 480,
        max_failed_login_attempts: 5,
        lockout_duration_minutes: 30,
        require_strong_passwords: true,
        two_factor_available: false,
        audit_log_retention_days: 90,
        ...result
      };
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
      return {
        email_verification_enabled: false,
        password_reset_enabled: true,
        session_timeout_minutes: 480,
        max_failed_login_attempts: 5,
        lockout_duration_minutes: 30,
        require_strong_passwords: true,
        two_factor_available: false,
        audit_log_retention_days: 90
      };
    }
  }

  async updateSecuritySettings(settings: Record<string, any>, userId: string): Promise<boolean> {
    return await this.updateMultipleSettings(settings, userId);
  }
}

export const systemSettingsService = new SystemSettingsService();