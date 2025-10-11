// src/components/team/TeamPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Users, MapPin, Mail, Phone, Briefcase, Edit, Eye, Save, Upload, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService, UserWithRole } from '../../lib/services/userService';
import { supabase, createUser } from '../../lib/supabase';

interface TeamPageProps {
  onNavigate: (section: string) => void;
}

type ViewFilter = 'all' | 'internal' | 'spain' | 'contractors';

interface ColumnConfig {
  id: keyof UserWithRole;
  label: string;
  visible: boolean;
}

export function TeamPage({ onNavigate }: TeamPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfileData, setEditingProfileData] = useState<Partial<UserWithRole>>({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add Staff Modal state
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role_type: 'External' as 'Master' | 'Senior' | 'HR' | 'Mid' | 'External'
  });

  // Real user data from database
  const [allUsers, setAllUsers] = useState<UserWithRole[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithRole[]>([]);

  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'display_name', label: 'Staff Name', visible: true },
    { id: 'job_title', label: 'Role', visible: true },
    { id: 'department', label: 'Department', visible: true },
    { id: 'email', label: 'Email', visible: true },
    { id: 'office_location', label: 'Location', visible: true },
    { id: 'availability_status', label: 'Status', visible: true },
  ]);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Filter users based on view and search
  useEffect(() => {
    filterUsers();
  }, [allUsers, viewFilter, searchQuery]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current user for permissions check
      const current = await userService.getCurrentUserWithRole();
      setCurrentUser(current);

      let users: UserWithRole[] = [];

      switch (viewFilter) {
        case 'internal':
          users = await userService.getInternalProfiles();
          break;
        case 'spain':
          users = await userService.getSpainProfiles();
          break;
        case 'contractors':
          users = await userService.getContractorProfiles();
          break;
        default:
          users = await userService.getAllUserProfiles();
      }

      setAllUsers(users);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load team data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = allUsers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleViewFilterChange = async (filter: ViewFilter) => {
    setViewFilter(filter);
    setLoading(true);
    
    try {
      let users: UserWithRole[] = [];
      
      switch (filter) {
        case 'internal':
          users = await userService.getInternalProfiles();
          break;
        case 'spain':
          users = await userService.getSpainProfiles();
          break;
        case 'contractors':
          users = await userService.getContractorProfiles();
          break;
        default:
          users = await userService.getAllUserProfiles();
      }
      
      setAllUsers(users);
    } catch (err) {
      console.error('Error loading filtered data:', err);
      setError('Failed to load team data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'unavailable':
        return 'Unavailable';
      case 'on_leave':
        return 'On Leave';
      default:
        return 'Unknown';
    }
  };

  const getRoleColor = (roleType?: string) => {
    switch (roleType) {
      case 'Master':
        return 'bg-purple-100 text-purple-800';
      case 'Senior':
        return 'bg-blue-100 text-blue-800';
      case 'Mid':
        return 'bg-green-100 text-green-800';
      case 'External':
        return 'bg-orange-100 text-orange-800';
      case 'HR':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleColumn = (columnId: keyof UserWithRole) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const toggleSelectAll = () => {
    if (selectedStaff.size === filteredUsers.length) {
      setSelectedStaff(new Set());
    } else {
      setSelectedStaff(new Set(filteredUsers.map(user => user.id)));
    }
  };

  // User editing functions
  const handleViewUser = (user: UserWithRole) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setEditingUser(null);
    setShowUserModal(false);
  };

  const handleOpenEditProfile = () => {
    if (editingUser) {
      setEditingProfileData({
        first_name: editingUser.first_name || '',
        last_name: editingUser.last_name || '',
        display_name: editingUser.display_name || '',
        job_title: editingUser.job_title || '',
        department: editingUser.department || '',
        phone: editingUser.phone || '',
        office_location: editingUser.office_location || '',
        preferred_communication: editingUser.preferred_communication || 'email',
        timezone: editingUser.timezone || ''
      });
      setShowEditProfileModal(true);
    }
  };

  const handleCloseEditProfile = () => {
    setShowEditProfileModal(false);
    setEditingProfileData({});
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    if (!editingUser) return;

    try {
      setProfileSaving(true);

      // Prepare profile data including avatar
      let profileUpdateData = { ...editingProfileData };

      // If there's a new avatar file, convert it to base64 data URL
      if (avatarFile && avatarPreview) {
        profileUpdateData.avatar_url = avatarPreview;
      }

      // Filter out empty string values that would violate database constraints
      Object.keys(profileUpdateData).forEach(key => {
        if (profileUpdateData[key] === '') {
          delete profileUpdateData[key];
        }
      });

      // Try database first, fall back to mock service
      let success = false;
      try {
        success = await userService.updateUserProfile(editingUser.id, profileUpdateData);
      } catch (dbError) {
        console.warn('Database unavailable, using mock service:', dbError);
        // Import MockUserService dynamically to avoid circular deps
        const { MockUserService } = await import('../../lib/userService.mock');
        success = await MockUserService.updateUserProfile(editingUser.id, profileUpdateData);
      }

      if (success) {
        toast.success('Profile updated successfully!');
        
        // Update the editingUser with new data
        const updatedUser = { ...editingUser, ...profileUpdateData };
        setEditingUser(updatedUser);
        
        // Refresh the user list
        await loadUserData();
        
        handleCloseEditProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Check if current user can edit others (Master level)
  const canEditUsers = currentUser?.role?.role_type === 'Master';

  // Staff creation functions
  const handleCreateStaff = async () => {
    if (!staffFormData.first_name || !staffFormData.last_name || !staffFormData.email || !staffFormData.role_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreatingStaff(true);
      
      // First approach: Try to create using admin privileges or service role
      let userId: string;
      let authSuccess = false;
      
      try {
        // Generate a temporary password
        const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!1`;
        
        console.log('Attempting to create user with email:', staffFormData.email);
        
        // Try the auth signup with more detailed error handling
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: staffFormData.email,
          password: tempPassword,
          options: {
            data: {
              first_name: staffFormData.first_name,
              last_name: staffFormData.last_name,
              display_name: `${staffFormData.first_name} ${staffFormData.last_name}`
            }
          }
        });

        if (authError) {
          console.error('Auth signup error:', authError);
          
          // Check for specific error types
          if (authError.message.includes('Email not confirmed')) {
            throw new Error('Email confirmation is required. Please check your Supabase Auth settings.');
          } else if (authError.message.includes('Database error')) {
            throw new Error('Database configuration issue. Please check your Supabase setup.');
          } else if (authError.message.includes('signup disabled')) {
            throw new Error('User registration is disabled in Supabase settings.');
          } else {
            throw new Error(`Authentication error: ${authError.message}`);
          }
        }

        if (!authData.user) {
          throw new Error('Failed to create user account - no user returned');
        }

        userId = authData.user.id;
        authSuccess = true;
        
        console.log('Auth user created successfully:', userId);

      } catch (authError) {
        console.error('Auth creation failed, trying alternative approach:', authError);
        
        // Alternative approach: Create a mock user ID for development
        // In production, this would require admin API calls or different approach
        userId = `mock-${Date.now()}-${Math.random().toString(36).slice(-8)}`;
        
        toast.error(`Auth creation failed: ${authError instanceof Error ? authError.message : 'Unknown error'}. Creating profile only.`);
      }

      // Create user profile
      console.log('Creating user profile for:', userId);
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: staffFormData.email,
          first_name: staffFormData.first_name,
          last_name: staffFormData.last_name,
          display_name: `${staffFormData.first_name} ${staffFormData.last_name}`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('Profile created successfully');

      // Assign role
      const roleLevel = {
        'Master': 1,
        'Senior': 2,
        'HR': 3,
        'Mid': 4,
        'External': 5
      }[staffFormData.role_type];

      console.log('Assigning role:', staffFormData.role_type, 'with level:', roleLevel);
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_type: staffFormData.role_type,
          role_level: roleLevel,
          assigned_by: currentUser?.id,
          assigned_at: new Date().toISOString(),
          is_active: true
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
        throw new Error(`Failed to assign user role: ${roleError.message}`);
      }

      console.log('Role assigned successfully');

      const successMessage = authSuccess 
        ? `Staff member ${staffFormData.first_name} ${staffFormData.last_name} created successfully!`
        : `Staff profile for ${staffFormData.first_name} ${staffFormData.last_name} created. Note: Auth account creation failed - user will need manual account setup.`;
      
      toast.success(successMessage);
      
      // Reset form
      setStaffFormData({
        first_name: '',
        last_name: '',
        email: '',
        role_type: 'External'
      });
      
      setShowAddStaffModal(false);
      
      // Reload user data to show the new staff member
      await loadUserData();
      
    } catch (error) {
      console.error('Error creating staff member:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create staff member: ${error.message}`);
      } else {
        toast.error('Failed to create staff member. Please try again.');
      }
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleCloseAddStaffModal = () => {
    setShowAddStaffModal(false);
    setStaffFormData({
      first_name: '',
      last_name: '',
      email: '',
      role_type: 'External'
    });
  };

  const toggleSelectStaff = (userId: string) => {
    const newSelected = new Set(selectedStaff);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedStaff(newSelected);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowColumnsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading team data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <X className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Team Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadUserData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">Manage and view all team members across the organization</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Team</p>
                <p className="text-2xl font-semibold text-gray-900">{allUsers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allUsers.filter(u => u.availability_status === 'available').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Internal</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allUsers.filter(u => ['Master', 'Senior', 'Mid'].includes(u.role?.role_type || '')).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Contractors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allUsers.filter(u => u.role?.role_type === 'External').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              {/* View Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewFilterChange('all')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Profiles ({allUsers.length})
                </button>
                <button
                  onClick={() => handleViewFilterChange('internal')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewFilter === 'internal'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Internal
                </button>
                <button
                  onClick={() => handleViewFilterChange('spain')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewFilter === 'spain'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Spain Profiles
                </button>
                <button
                  onClick={() => handleViewFilterChange('contractors')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewFilter === 'contractors'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Contractors
                </button>
              </div>

              {/* Search and Actions */}
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Columns
                  </button>
                  
                  {showColumnsDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        {columns.map((column) => (
                          <label key={column.id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={column.visible}
                              onChange={() => toggleColumn(column.id)}
                              className="mr-2"
                            />
                            {column.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {canEditUsers && (
                  <button
                    onClick={() => setShowAddStaffModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Staff
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedStaff.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  {columns.filter(col => col.visible).map((column) => (
                    <th key={column.id} className="text-left p-4 font-medium text-gray-700">
                      {column.label}
                    </th>
                  ))}
                  <th className="text-left p-4 font-medium text-gray-700">Role Level</th>
                  {canEditUsers && <th className="text-left p-4 font-medium text-gray-700">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedStaff.has(user.id)}
                        onChange={() => toggleSelectStaff(user.id)}
                        className="rounded"
                      />
                    </td>
                    
                    {columns.find(col => col.id === 'display_name')?.visible && (
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.display_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {user.display_name?.charAt(0) || user.email?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{user.display_name || 'No Name'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    
                    {columns.find(col => col.id === 'job_title')?.visible && (
                      <td className="p-4 text-gray-700">{user.job_title || 'No Title'}</td>
                    )}
                    
                    {columns.find(col => col.id === 'department')?.visible && (
                      <td className="p-4 text-gray-700">{user.department || 'No Department'}</td>
                    )}
                    
                    {columns.find(col => col.id === 'email')?.visible && (
                      <td className="p-4">
                        <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800">
                          {user.email}
                        </a>
                      </td>
                    )}
                    
                    {columns.find(col => col.id === 'office_location')?.visible && (
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gray-700">
                          <MapPin className="w-4 h-4" />
                          {user.office_location || 'Unknown'}
                        </div>
                      </td>
                    )}
                    
                    {columns.find(col => col.id === 'availability_status')?.visible && (
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.availability_status)}`}>
                          {formatStatus(user.availability_status)}
                        </span>
                      </td>
                    )}
                    
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role?.role_type)}`}>
                        {user.role?.role_type || 'No Role'}
                      </span>
                    </td>
                    {canEditUsers && (
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'No users match the current filter.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser.display_name || `${editingUser.first_name} ${editingUser.last_name}`}
              </h3>
              <button
                onClick={handleCloseUserModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-16 h-16 rounded-full bg-cover bg-center border border-gray-200"
                  style={{
                    backgroundImage: editingUser.avatar_url
                      ? `url("${editingUser.avatar_url}")`
                      : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(editingUser.display_name || `${editingUser.first_name || ''} ${editingUser.last_name || ''}`).trim()}&background=6366f1&color=ffffff")`
                  }}
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {editingUser.display_name || `${editingUser.first_name} ${editingUser.last_name}`}
                  </h4>
                  <p className="text-sm text-gray-500">{editingUser.email}</p>
                  <p className="text-sm text-gray-500">{editingUser.job_title || 'No title'}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <p className="text-sm text-gray-900">{editingUser.department || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-sm text-gray-900">{editingUser.office_location || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(editingUser.role?.role_type)}`}>
                    {editingUser.role?.role_type || 'No Role'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    editingUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {editingUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {editingUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{editingUser.phone}</p>
                  </div>
                )}

                {editingUser.start_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-sm text-gray-900">{new Date(editingUser.start_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={handleCloseUserModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
                {canEditUsers && (
                  <button
                    onClick={handleOpenEditProfile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Editing Modal */}
      {showEditProfileModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={handleCloseEditProfile}
                className="text-gray-400 hover:text-gray-600"
                disabled={profileSaving}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form */}
            <div className="p-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <div
                    className="w-20 h-20 rounded-full bg-cover bg-center border-4 border-white shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundImage: avatarPreview 
                        ? `url("${avatarPreview}")`
                        : editingUser.avatar_url
                        ? `url("${editingUser.avatar_url}")`
                        : `url("https://ui-avatars.com/api/?name=${editingProfileData.first_name || editingUser.first_name}+${editingProfileData.last_name || editingUser.last_name}&background=random")`
                    }}
                    onClick={triggerAvatarUpload}
                  />
                  <button
                    type="button"
                    onClick={triggerAvatarUpload}
                    className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                    disabled={profileSaving}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingUser.display_name || `${editingUser.first_name} ${editingUser.last_name}`}
                  </h3>
                  <p className="text-gray-600">{editingUser.email}</p>
                  <button
                    type="button"
                    onClick={triggerAvatarUpload}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    disabled={profileSaving}
                  >
                    <Upload className="w-3 h-3" />
                    Change Profile Picture
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editingProfileData.first_name || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editingProfileData.last_name || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editingProfileData.display_name || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={editingProfileData.job_title || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={editingProfileData.department || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, department: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  >
                    <option value="">Select Department</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Technical">Technical</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingProfileData.phone || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
                  <select
                    value={editingProfileData.office_location || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, office_location: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  >
                    <option value="">Select Location</option>
                    <option value="UK">UK</option>
                    <option value="Spain">Spain</option>
                    <option value="Remote">Remote</option>
                    <option value="Client Site">Client Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Communication</label>
                  <select
                    value={editingProfileData.preferred_communication || 'email'}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, preferred_communication: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={profileSaving}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="teams">Teams</option>
                    <option value="slack">Slack</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <input
                    type="text"
                    value={editingProfileData.timezone || ''}
                    onChange={(e) => setEditingProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Europe/London"
                    disabled={profileSaving}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                <button
                  onClick={handleCloseEditProfile}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={profileSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {profileSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
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
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Staff Member</h2>
              <button
                onClick={handleCloseAddStaffModal}
                className="text-gray-400 hover:text-gray-600"
                disabled={isCreatingStaff}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Form */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={staffFormData.first_name}
                    onChange={(e) => setStaffFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                    disabled={isCreatingStaff}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={staffFormData.last_name}
                    onChange={(e) => setStaffFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                    disabled={isCreatingStaff}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={staffFormData.email}
                    onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                    disabled={isCreatingStaff}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Tier *
                  </label>
                  <select
                    value={staffFormData.role_type}
                    onChange={(e) => setStaffFormData(prev => ({ ...prev, role_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isCreatingStaff}
                  >
                    <option value="External">External</option>
                    <option value="Mid">Mid</option>
                    <option value="HR">HR/Finance</option>
                    <option value="Senior">Senior</option>
                    <option value="Master">Master</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This determines the staff member's access level and permissions
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleCloseAddStaffModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isCreatingStaff}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStaff}
                  disabled={isCreatingStaff || !staffFormData.first_name || !staffFormData.last_name || !staffFormData.email}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreatingStaff ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Staff Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}