import { supabase, auth } from '../lib/supabase';

export async function setupCurrentUserProfile() {
  try {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }

    console.log('Setting up profile for user:', user.email);

    // Extract names from metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        display_name: fullName || `${firstName} ${lastName}`.trim(),
        job_title: 'Platform Owner',
        department: 'Technology',
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    console.log('Profile created:', profileData);

    // Create user role (Master)
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role_type: 'Master',
        role_level: 1,
        assigned_by: user.id,
        is_active: true,
        assigned_at: new Date().toISOString()
      })
      .select()
      .single();

    if (roleError) {
      console.error('Role creation error:', roleError);
      throw roleError;
    }

    console.log('Role created:', roleData);

    // Create user preferences
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        theme: 'light',
        language: 'en',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        email_notifications: true,
        push_notifications: true,
        project_updates: true,
        system_alerts: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (prefsError) {
      console.error('Preferences creation error:', prefsError);
      throw prefsError;
    }

    console.log('Preferences created:', prefsData);

    console.log('✅ User profile setup complete!');
    return { profile: profileData, role: roleData, preferences: prefsData };

  } catch (error) {
    console.error('❌ Failed to setup user profile:', error);
    throw error;
  }
}

// Make it available globally for browser console use
(window as any).setupUserProfile = setupCurrentUserProfile;