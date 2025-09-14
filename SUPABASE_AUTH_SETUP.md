# Supabase Authentication Setup Guide

## 🔐 Setting Up Password Reset Functionality

### 1. **Get Your Project Credentials**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/wyixydnywhpiewgsfimc
2. **Navigate to**: Settings → API
3. **Copy the following values**:
   - **Project URL**: `https://wyixydnywhpiewgsfimc.supabase.co`
   - **anon key**: The long JWT token (starts with `eyJhbGciOiJIUzI1NiIs...`)

### 2. **Update Your Environment Variables**

Update your `.env` file with:
```bash
VITE_SUPABASE_URL=https://wyixydnywhpiewgsfimc.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. **Configure Authentication Settings**

In your Supabase Dashboard:

#### A. **Basic Auth Settings**
1. Go to **Authentication → Settings**
2. **Site URL**: Set to `http://localhost:5173` (for development)
3. **Additional redirect URLs**: Add `http://localhost:5173`

#### B. **Email Settings**
1. **Enable email confirmations**: Toggle ON/OFF based on your needs
2. **Secure email change**: Recommended to keep ON
3. **Email rate limiting**: Keep default settings

#### C. **Password Reset Configuration**
1. **Enable password recovery**: Should be ON by default
2. **Password reset email template**:
   - Go to **Authentication → Email Templates**
   - Customize the "Reset Password" template if desired
   - Ensure the template includes `{{ .ConfirmationURL }}`

### 4. **Email Template Setup (Optional)**

You can customize the password reset email template:

1. **Go to**: Authentication → Email Templates → Reset Password
2. **Subject**: `Reset your password for IntraExtra`
3. **Body**: Customize as needed, but ensure it includes:
   ```html
   <h2>Reset your password</h2>
   <p>Click the link below to reset your password for IntraExtra:</p>
   <a href="{{ .ConfirmationURL }}">Reset Password</a>
   <p>If you didn't request this, you can safely ignore this email.</p>
   ```

### 5. **Development vs Production Settings**

#### Development (localhost:5173)
```
Site URL: http://localhost:5173
Redirect URLs: http://localhost:5173
```

#### Production (when deploying)
```
Site URL: https://yourdomain.com
Redirect URLs: https://yourdomain.com
```

### 6. **Test the Setup**

1. **Refresh your application** to load new environment variables
2. **Check connection status** in the top-right corner of the login page
3. **Try password reset**:
   - Click "Forgot your password?"
   - Enter any email address
   - Check your email for the reset link
   - Click the link to test the reset flow

### 7. **Common Issues & Solutions**

#### ❌ **"Invalid API key" error**
- **Solution**: Double-check your anon key from Settings → API
- Use the "Database Setup" button on login page to verify credentials

#### ❌ **"CORS error" or redirect issues**
- **Solution**: Ensure `http://localhost:5173` is in your redirect URLs
- Check that Site URL matches your development server

#### ❌ **Email not received**
- **Solution**: Check spam folder
- Verify email settings in Authentication → Settings
- For development, emails might go to your Supabase project's email logs

#### ❌ **Reset link doesn't work**
- **Solution**: Ensure the redirect URL in your app matches Supabase settings
- Check that the link hasn't expired (default: 1 hour)

### 8. **Security Recommendations**

1. **Never commit** your actual API keys to version control
2. **Use different projects** for development and production
3. **Enable RLS (Row Level Security)** on your tables
4. **Set up proper user roles** and permissions
5. **Use strong password requirements** in production

### 9. **Production Deployment**

When deploying to production:

1. **Create a new Supabase project** for production (optional but recommended)
2. **Update environment variables** in your deployment platform
3. **Configure auth settings** with your production domain
4. **Set up email delivery** (SMTP) for reliable email sending
5. **Test all auth flows** in the production environment

---

## 🆘 **Need Help?**

If you encounter issues:

1. **Check the connection status** indicator on the login page
2. **Use the "Database Setup"** tool to test your credentials
3. **Review your Supabase project logs** in the Dashboard
4. **Verify all URLs and redirects** match your application

The password reset functionality is now fully implemented and ready to use once properly configured!