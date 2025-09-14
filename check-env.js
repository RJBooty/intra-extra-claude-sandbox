// Environment variable checker
console.log('=== Environment Variables Check ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'NOT SET');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY || 'NOT SET');
console.log('=====================================');

// Check if they match expected values
const expectedUrl = 'https://wrfhkbafhwarvvgogvda.supabase.co';
const expectedKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZmhrYmFmaHdhcnZ2Z29ndmRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTg5NDAsImV4cCI6MjA2ODY3NDk0MH0.WUuDwWzyrUwN75K1JfwBwQ3zx0m0-G_kgUQlFDrmdc4';

console.log('URL matches expected:', import.meta.env.VITE_SUPABASE_URL === expectedUrl);
console.log('Key matches expected:', import.meta.env.VITE_SUPABASE_ANON_KEY === expectedKey);