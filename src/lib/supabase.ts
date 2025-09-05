import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for authentication
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

// Helper function to get user role
export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('platform_user_roles')
    .select('role_level')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user role:', error)
    return 'user' // default role
  }
  
  return data?.role_level || 'user'
}

// Helper function to check if user is master
export const isMasterUser = async (userId: string) => {
  const role = await getUserRole(userId)
  return role === 'master'
}

// Database helpers with error handling
export async function getClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      // Return empty array if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('Clients table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export async function createClient(clientData: any) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create client:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      // Return empty array if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('Projects table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export async function createProject(projectData: any) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}