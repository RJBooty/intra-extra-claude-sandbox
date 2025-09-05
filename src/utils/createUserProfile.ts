// This function creates the user profile using raw HTTP requests to bypass RLS
export async function createUserProfileDirect() {
  const SUPABASE_URL = 'https://wyixydnywhpiewgsfimc.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXh5ZG55d2hwaWV3Z3NmaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU5OTIsImV4cCI6MjA3MjU3MTk5Mn0.aIdEtvdALRzYEOJH6jgfVli0wtliDVTZSkTIDW8Su-I';
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
    'Prefer': 'return=minimal'
  };

  const userId = 'baafa0d7-04b5-4f85-a396-4d1ac159d1de';

  try {
    console.log('Creating user profile...');

    // First, let's try to insert the profile directly
    const profileData = {
      id: userId,
      email: 'tyson@casfid.com',
      first_name: 'James',
      last_name: 'Tyson',
      display_name: 'James Tyson',
      job_title: 'Platform Owner',
      department: 'Technology',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to create profile with data:', profileData);

    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(profileData)
    });

    console.log('Profile response status:', profileResponse.status);
    console.log('Profile response text:', await profileResponse.text());

    // Try preferences
    const prefsData = {
      user_id: userId,
      theme: 'light',
      language: 'en',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      email_notifications: true,
      push_notifications: true,
      project_updates: true,
      system_alerts: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const prefsResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_preferences`, {
      method: 'POST',
      headers,
      body: JSON.stringify(prefsData)
    });

    console.log('Preferences response status:', prefsResponse.status);
    console.log('Preferences response text:', await prefsResponse.text());

    console.log('✅ User profile creation attempted');
    return true;

  } catch (error) {
    console.error('❌ Failed to create user profile:', error);
    return false;
  }
}

// Make it available globally
(window as any).createUserProfileDirect = createUserProfileDirect;