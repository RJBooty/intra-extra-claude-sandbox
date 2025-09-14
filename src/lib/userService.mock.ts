// Mock User Service for Development
// This provides demo users when database is not available

import { UserWithRole, UserProfile, UserRole } from './userService';

// Demo users for the platform - initialize from localStorage or default
const initializeDemoUsers = (): UserWithRole[] => {
  const stored = localStorage.getItem('demo_users');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored demo users, using defaults');
    }
  }
  
  return [
    {
      // James Tyson - Master User
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'tyson@casfid.com',
      first_name: 'James',
      last_name: 'Tyson',
      display_name: 'James Tyson',
      phone: '+44 7890 123456',
      avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      job_title: 'Platform Owner',
      department: 'Executive',
      office_location: 'London, UK',
      start_date: '2020-01-15',
      manager_id: null,
      preferred_communication: 'email',
      timezone: 'Europe/London',
      is_active: true,
      last_login: '2024-01-15T10:30:00Z',
      created_at: '2020-01-15T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    role: {
      id: 'role-001',
      user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      role_type: 'Master',
      role_level: 5,
      assigned_by: null,
      assigned_at: '2020-01-15T00:00:00Z',
      is_active: true
    },
    preferences: null
  },
  {
    // Tundra Tides - Senior User
    id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    email: 'tundra@casfid.com',
    first_name: 'Tundra',
    last_name: 'Tides',
    display_name: 'Tundra Tides',
    phone: '+44 7890 234567',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    job_title: 'Senior Project Manager',
    department: 'Operations',
    office_location: 'London, UK',
    start_date: '2021-03-20',
    manager_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    preferred_communication: 'teams',
    timezone: 'Europe/London',
    is_active: true,
    last_login: '2024-01-15T09:30:00Z', // 1 hour ago
    created_at: '2021-03-20T00:00:00Z',
    updated_at: '2024-01-15T09:30:00Z',
    role: {
      id: 'role-002',
      user_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
      role_type: 'Senior',
      role_level: 4,
      assigned_by: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      assigned_at: '2021-03-20T00:00:00Z',
      is_active: true
    },
    preferences: null
  }
  ];
};

// Initialize and export the demo users
export let DEMO_USERS = initializeDemoUsers();

// Function to save users to localStorage
const saveDemoUsers = () => {
  localStorage.setItem('demo_users', JSON.stringify(DEMO_USERS));
};

// Mock user service class
export class MockUserService {
  static async getAllUsers(): Promise<UserWithRole[]> {
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return DEMO_USERS;
  }

  static async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role_type: UserRole['role_type'];
  }): Promise<UserWithRole> {
    // Create new user with basic details
    const newUser: UserWithRole = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      display_name: `${userData.first_name} ${userData.last_name}`,
      phone: null,
      avatar_url: `https://ui-avatars.com/api/?name=${userData.first_name}+${userData.last_name}&background=random`,
      job_title: null,
      department: null,
      office_location: null,
      start_date: new Date().toISOString().split('T')[0],
      manager_id: null,
      preferred_communication: 'email',
      timezone: 'Europe/London',
      is_active: true,
      last_login: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: {
        id: `role-${Date.now()}`,
        user_id: '',
        role_type: userData.role_type,
        role_level: userData.role_type === 'Master' ? 5 : 
                   userData.role_type === 'Senior' ? 4 :
                   userData.role_type === 'Mid' ? 3 :
                   userData.role_type === 'External' ? 2 : 1,
        assigned_by: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // James Tyson
        assigned_at: new Date().toISOString(),
        is_active: true
      },
      preferences: null
    };
    
    // Update the user_id in role
    newUser.role!.user_id = newUser.id;
    
    // Add to demo users
    DEMO_USERS.push(newUser);
    
    return newUser;
  }

  static async updateUserRole(userId: string, newRole: UserRole['role_type']): Promise<boolean> {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user && user.role) {
      user.role.role_type = newRole;
      user.role.role_level = newRole === 'Master' ? 5 : 
                             newRole === 'Senior' ? 4 :
                             newRole === 'Mid' ? 3 :
                             newRole === 'External' ? 2 : 1;
      user.updated_at = new Date().toISOString();
      
      // Save to localStorage to persist changes
      saveDemoUsers();
      
      return true;
    }
    return false;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserWithRole>): Promise<boolean> {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      // Update user properties
      Object.keys(updates).forEach(key => {
        if (key !== 'role' && key !== 'preferences' && updates[key as keyof UserWithRole] !== undefined) {
          (user as any)[key] = updates[key as keyof UserWithRole];
        }
      });
      
      // Update timestamp
      user.updated_at = new Date().toISOString();
      
      // Save to localStorage to persist changes
      saveDemoUsers();
      
      return true;
    }
    return false;
  }

  static async getCurrentUserProfile(): Promise<UserWithRole | null> {
    // Return James Tyson as the current user for testing (Master role)
    return DEMO_USERS[0];
  }

  static async getCurrentUserWithRole(): Promise<UserWithRole | null> {
    // Return James Tyson with full role data for testing
    return DEMO_USERS[0];
  }
}

export default MockUserService;