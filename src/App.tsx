import React, { useState, useEffect } from 'react';
import { auth, getUserRole } from './lib/supabase';
import { LoginPage } from './components/auth/LoginPage';
<<<<<<< HEAD
import { PasswordResetRequest } from './components/auth/PasswordResetRequest';
import { PasswordResetConfirm } from './components/auth/PasswordResetConfirm';
=======
>>>>>>> 154385223d8bb9b733eed09dd439631b10769d25
import { Dashboard } from './components/layout/Dashboard';
import { Header } from './components/layout/Header';
import { ProjectView } from './components/project/ProjectView';
import { ProjectForm } from './components/forms/ProjectForm';
import { PhaseTracker } from './components/project/PhaseTracker';
import { DocumentManager } from './components/project/DocumentManager';
import { ProjectMetadata } from './components/project/ProjectMetadata';
import { SalesPipeline } from './components/sales/SalesPipeline';
import { Toast } from './components/ui/Toast';
import { Sidebar } from './components/layout/Sidebar';
import { SettingsHoldingPage } from './components/settings/SettingsHoldingPage';
import { TeamPage } from './components/team/TeamPage';
import { UserProfilePage } from './components/settings/UserProfilePage';
import { ProjectsList } from './components/project/ProjectsList';
import { AuthStatus } from './components/debug/AuthStatus';
import { GuardsPage } from './components/guards/GuardsPage';
import { ROI3 } from './components/roi/ROI3';
import { ClientsPage } from './components/clients/ClientsPage';
import { Project } from './types';

type TabId = 'projects' | 'sales' | 'roi' | 'operations' | 'clients' | 'marketing' | 'support' | 'analytics' | 'settings' | 'guards' | 'new-project' | 'team' | 'user-profile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<string>('external');
  const [appError, setAppError] = useState<string | null>(null);
<<<<<<< HEAD
  const [authView, setAuthView] = useState<'login' | 'reset-request' | 'reset-confirm'>('login');

  // Check URL for password reset parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get('type');
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');

    if (type === 'recovery' && accessToken && refreshToken) {
      console.log('Password reset URL detected, setting authView to reset-confirm');
      setAuthView('reset-confirm');
      setIsAuthenticated(false); // Force to show reset form even if authenticated
    }
  }, []);
=======
>>>>>>> 154385223d8bb9b733eed09dd439631b10769d25

  // Real authentication checking with timeout
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
<<<<<<< HEAD

        // Add timeout to prevent hanging
        const authPromise = auth.getCurrentUser();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
        );

        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        console.log('Current user:', currentUser);

        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);

=======
        
        // Add timeout to prevent hanging
        const authPromise = auth.getCurrentUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
        );
        
        const currentUser = await Promise.race([authPromise, timeoutPromise]);
        console.log('Current user:', currentUser);
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          
>>>>>>> 154385223d8bb9b733eed09dd439631b10769d25
          // Fetch user role from database
          try {
            const role = await getUserRole(currentUser.id);
            console.log('User role fetched:', role);
            setUserRole(role);
          } catch (roleError) {
            console.error('Error fetching user role:', roleError);
            setUserRole('external'); // fallback
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAppError(`Authentication error: ${error.message}`);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth().catch(error => {
      console.error('Failed to check auth:', error);
      setAppError(`Failed to initialize auth: ${error.message}`);
      setIsLoading(false);
    });

    // Listen for auth state changes
    try {
      const { data: { subscription } } = auth.onAuthStateChange(async (authUser) => {
        console.log('Auth state changed:', authUser);
        if (authUser) {
          setUser(authUser);
          setIsAuthenticated(true);
          
          // Fetch user role when auth state changes
          try {
            const role = await getUserRole(authUser.id);
            console.log('User role fetched on auth change:', role);
            setUserRole(role);
          } catch (roleError) {
            console.error('Error fetching user role on auth change:', roleError);
            setUserRole('external'); // fallback
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserRole('external'); // reset role when logged out
        }
        setIsLoading(false);
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      setAppError(`Failed to set up auth listener: ${error.message}`);
      setIsLoading(false);
    }
  }, []);

  const [currentView, setCurrentView] = useState<'dashboard' | 'app'>('dashboard');
  const [activeTab, setActiveTab] = useState<TabId>('projects');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add a failsafe debug log - now all variables are initialized
  console.log('App render state:', { isLoading, appError, isAuthenticated, currentView, activeTab, userRole });

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project);
    setShowProjectDetail(true);
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setShowProjectDetail(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Search query:', query);
  };

  const handleNavigate = (section: string) => {
    console.log('=== HANDLE NAVIGATE CALLED ===');
    console.log('Section requested:', section);
    console.log('Before navigation - currentView:', currentView);
    console.log('Before navigation - activeTab:', activeTab);
    console.log('Before navigation - showProjectDetail:', showProjectDetail);
    console.log('Before navigation - currentProject:', currentProject?.id || 'null');
    
    console.log('Navigation requested:', section);
    
    if (section === 'dashboard') {
      console.log('>>> DASHBOARD NAVIGATION PATH');
      setCurrentView('dashboard');
      setShowProjectDetail(false);
      setCurrentProject(null);
    } else if (section === 'new-project') {
      console.log('>>> NEW PROJECT NAVIGATION PATH');
      setCurrentView('app');
      setActiveTab('new-project');
      setShowProjectDetail(true);
      setCurrentProject(null);
    } else if (section === 'projects') {
      console.log('>>> PROJECTS NAVIGATION PATH');
      console.log('Projects navigation - setting view to app with projects tab');
      // Use batch state update to prevent timing issues
      setCurrentView('app');
      setActiveTab('projects');
      setShowProjectDetail(false);
      setCurrentProject(null);
    } else {
      console.log('>>> OTHER SECTION NAVIGATION PATH');
      // All other sections go directly to app view
      setCurrentView('app');
      
      // Map sections to their corresponding tabs
      if (section === 'sales') {
        console.log('Setting activeTab to: sales');
        setActiveTab('sales');
      } else if (section === 'team') {
        console.log('Setting activeTab to: team');
        setActiveTab('team');
      } else if (section === 'clients') {
        console.log('Setting activeTab to: clients');
        setActiveTab('clients');
      } else if (section === 'reports') {
        console.log('Setting activeTab to: analytics');
        setActiveTab('analytics');
      } else if (section === 'settings' || section === 'settings/profile') {
        console.log('Setting activeTab to: settings');
        setActiveTab('settings');
      } else if (section === 'user-profile') {
        console.log('Setting activeTab to: user-profile');
        setActiveTab('user-profile');
      } else if (section === 'guards') {
        console.log('Setting activeTab to: guards');
        setActiveTab('guards');
      } else if (section === 'roi') {
        console.log('Setting activeTab to: roi');
        setActiveTab('roi');
      } else {
        console.log('Setting activeTab to: projects (default)');
        // Default fallback
        setActiveTab('projects');
      }
      
      setShowProjectDetail(false);
      setCurrentProject(null);
    }
    
    // Log state after navigation (will show in next render)
    console.log('Navigation state changes queued');
    console.log('=== END HANDLE NAVIGATE ===');
    
    console.log('Navigation completed:', { 
      currentView,
      activeTab,
      showProjectDetail: section === 'new-project'
    });
  };

  // Show error if there was an app error
  if (appError) {
    console.error('App error:', appError);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Application Error</strong>
            <p className="block sm:inline mt-2">{appError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while checking authentication
  if (isLoading) {
    console.log('App: Still loading authentication...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading IntraExtra...</p>
          <button 
            onClick={() => {
              setIsLoading(false);
              setIsAuthenticated(true);
              setAppError(null);
              // Set a mock user for development
              setUser({
                id: 'dev-user-id',
                email: 'tyson@casfid.com',
                user_metadata: {
                  first_name: 'James',
                  last_name: 'Tyson',
                  display_name: 'James Tyson (Dev Mode)'
                }
              });
              setUserRole('master'); // Set master role for dev mode
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Skip Auth (Development)
          </button>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    switch (authView) {
      case 'reset-request':
        return (
          <PasswordResetRequest
            onBackToLogin={() => setAuthView('login')}
          />
        );
      case 'reset-confirm':
        return (
          <PasswordResetConfirm
            onSuccess={() => {
              setAuthView('login');
              // Clear the URL parameters
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
            onError={() => setAuthView('reset-request')}
          />
        );
      default:
        return (
          <LoginPage
            onLogin={() => {
              // onLogin will be handled automatically by the auth state listener
              console.log('Login callback triggered');
            }}
            onForgotPassword={() => setAuthView('reset-request')}
          />
        );
    }
=======
  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {
      // onLogin will be handled automatically by the auth state listener
      console.log('Login callback triggered');
    }} />;
>>>>>>> 154385223d8bb9b733eed09dd439631b10769d25
  }

  // Show dashboard view
  if (currentView === 'dashboard') {
    console.log('App: RENDERING DASHBOARD VIEW');
    console.log('App: currentView:', currentView);
    console.log('App: activeTab:', activeTab);
    console.log('App: isAuthenticated:', isAuthenticated);
    console.log('App: user:', user);
    return <Dashboard onNavigate={handleNavigate} />;
  }

  console.log('RENDERING APP VIEW');
  console.log('currentView:', currentView);
  console.log('activeTab:', activeTab);
  console.log('showProjectDetail:', showProjectDetail);

  // Show main application view
  const renderTabContent = () => {
    console.log('RENDER TAB CONTENT CALLED');
    console.log('activeTab:', activeTab);
    console.log('showProjectDetail:', showProjectDetail);
    console.log('currentProject:', currentProject?.id || 'null');
    console.log('userRole:', userRole);
    
    // Show project detail view if a project is selected
    if (showProjectDetail && currentProject) {
      console.log('>>> RENDERING PROJECT DETAIL VIEW');
      return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
          <div className="layout-container flex h-full grow flex-col">
            <div className="gap-1 px-3 flex flex-1 justify-start py-5">
              {/* Persistent Sidebar */}
              <Sidebar currentView="projects" onNavigate={handleNavigate} />
              
              {/* Project Detail Content */}
              <ProjectView
                project={currentProject}
                onBack={() => setShowProjectDetail(false)}
                onNavigate={handleNavigate}
                userRole={userRole}
              />
            </div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'projects':
        console.log('>>> PROJECTS TAB CASE');
        console.log('>>> RENDERING PROJECTS LIST');
        console.log('User object in App:', user);
        console.log('Passing userRole:', userRole);
        console.log('Passing userId:', user?.id);
        
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView="projects" onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <ProjectsList 
                    onNavigate={handleNavigate} 
                    onProjectSelect={handleProjectSelect}
                    userRole={userRole}
                    userId={user?.id}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'new-project':
        console.log('>>> NEW PROJECT FORM CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView="projects" onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <div className="flex flex-wrap justify-between gap-3 p-4">
                    <h1 className="text-[#101418] tracking-light text-[32px] font-bold leading-tight min-w-72">
                      New Project
                    </h1>
                  </div>

                  {/* Project Form */}
                  <ProjectForm 
                    onProjectCreated={handleProjectCreated}
                    userRole={userRole}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'sales':
        console.log('>>> SALES TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView="sales" onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <SalesPipeline />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'roi':
        console.log('>>> ROI TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <ROI3 project={currentProject} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'team':
        console.log('>>> TEAM TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <TeamPage onNavigate={handleNavigate} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'guards':
        console.log('>>> GUARDS TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <GuardsPage onNavigate={handleNavigate} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'user-profile':
        console.log('>>> USER PROFILE TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <UserProfilePage onBack={() => handleNavigate('settings')} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'clients':
        console.log('>>> CLIENTS TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  <ClientsPage />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        console.log('>>> DEFAULT TAB CASE');
        return (
          <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
            <div className="layout-container flex h-full grow flex-col">
              <div className="gap-1 px-3 flex flex-1 justify-start py-5">
                {/* Persistent Sidebar */}
                <Sidebar currentView={activeTab} onNavigate={handleNavigate} />
                
                <div className="layout-content-container flex flex-col flex-1 ml-4">
                  {activeTab === 'settings' ? (
                    <SettingsHoldingPage onNavigate={handleNavigate} />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
                        <p className="text-gray-600">This module is under development.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Add a comprehensive try-catch for the entire render
  try {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden">
        {/* Temporarily removed AuthStatus to debug */}
        <Toast />
        
        <div className="layout-container flex h-full grow flex-col">
          <Header onSearch={handleSearch} onNavigateToDashboard={() => setCurrentView('dashboard')} onNavigate={handleNavigate} />
          
          <div className="flex-1 overflow-hidden">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Render error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Render Error</strong>
            <p className="block sm:inline mt-2">Failed to render application: {error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;