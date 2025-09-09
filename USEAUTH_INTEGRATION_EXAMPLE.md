# useAuth Hook Integration Example

Your `useAuth` hook is now ready! Here's how you can optionally update your App.tsx to use it:

## Option 1: Keep Current Implementation (Recommended)
Your current App.tsx works perfectly and doesn't need changes. The `useAuth` hook is available for other components that need auth functionality.

## Option 2: Update App.tsx to Use useAuth Hook

If you want to simplify your App.tsx, here's how to update it:

```typescript
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading, isAuthenticated, userRole, login, logout } = useAuth();
  
  // Your existing state
  const [currentView, setCurrentView] = useState<'dashboard' | 'app'>('dashboard');
  const [activeTab, setActiveTab] = useState<TabId>('projects');
  // ... rest of your state

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading IntraExtra...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={() => {
      // onLogin will be handled automatically by the useAuth hook
    }} />;
  }

  // Rest of your App.tsx remains the same...
}
```

## Using in Other Components

```typescript
import { useAuth } from '../hooks/useAuth';

function SomeComponent() {
  const { user, userRole, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome {user?.email}</h1>
      <p>Your role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## With Context Provider (Optional)

If you want to use the context provider, wrap your App:

```typescript
// In main.tsx or index.tsx
import { AuthProvider } from './hooks/useAuth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// Then in components, use:
import { useAuthContext } from '../hooks/useAuth';

function SomeComponent() {
  const { user, userRole } = useAuthContext();
  // ...
}
```

## Key Features of Your useAuth Hook

✅ **Complete Integration**: Works with your existing Supabase setup
✅ **Role Loading**: Automatically fetches user role from `platform_user_roles` table  
✅ **Profile Loading**: Fetches user profile data from `user_profiles` table
✅ **Error Handling**: Comprehensive error states and handling
✅ **Loading States**: Proper loading management for better UX
✅ **Auto Refresh**: Automatically updates when auth state changes
✅ **Type Safety**: Full TypeScript support with your permission system
✅ **Backward Compatible**: Works alongside your current App.tsx implementation

Your hook is ready to use wherever you need authentication state in your app!