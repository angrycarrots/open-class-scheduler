# 🚀 Deployment Guide: Local to Remote Supabase

This guide will help you deploy your yoga class scheduling system from local development to production using Supabase Cloud.

## 📋 Prerequisites

- [ ] Supabase account (free tier available)
- [ ] Your local project working correctly
- [ ] Git repository set up (already done)

## 🔧 Step 1: Create Remote Supabase Project

### 1.1 Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `yoga-class-scheduler` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🗄️ Step 2: Initialize Remote Database

> The project has two SQL files: the main schema and an additive Waivers migration.
> - `supabase/schema.sql` (core tables, policies, triggers, sample data for dev)
> - `supabase/waivers.sql` (adds `waivers` and `user_waivers`, policies, seed active waiver)

### Option A: Using Supabase CLI (Recommended)

```bash
# Link to your remote project
supabase link --project-ref your-project-ref

# Push existing migrations or run SQL files manually (recommended for these flat SQL files)
# Apply core schema
supabase db execute --file supabase/schema.sql

# Apply waivers additive migration
supabase db execute --file supabase/waivers.sql

# Verify
supabase db dump --data-only --schema public | head -n 50
```

### Option B: Manual SQL Execution

1. Go to your Supabase Dashboard → **SQL Editor**
2. Paste and execute `supabase/schema.sql`
3. Paste and execute `supabase/waivers.sql`
4. Verify tables exist in **Table Editor** (`profiles`, `yoga_classes`, `class_registrations`, `waivers`, `user_waivers`)

## 🔐 Step 3: Set Up Authentication

### 3.1 Configure Auth Settings
1. Go to **Authentication** → **Settings**
2. Configure your site URL (your deployment URL)
3. Set up email templates if needed

### 3.2 Create Admin User
1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Create admin user:
   - **Email**: `admin@example.com`
   - **Password**: `password123` (change in production!)
4. The profile will be auto-created by the trigger

## 🌐 Step 4: Update Environment Variables

### 4.1 Create Production Environment File
Create `.env.production`:

```bash
# Supabase Configuration (Production)
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-remote-anon-key"

# Email Configuration (Production)
VITE_EMAIL_PROVIDER="sendgrid"       # or resend, aws-ses, etc.
VITE_EMAIL_API_KEY="your-email-provider-api-key"
VITE_EMAIL_FROM="noreply@yogaclass.com"
```

### 4.2 Update Local Development
Keep `.env.local` for local development:

```bash
# Supabase Configuration (Local Development)
VITE_SUPABASE_URL="http://127.0.0.1:54321"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Email Configuration (Local with Inbucket)
VITE_EMAIL_PROVIDER="inbucket"
VITE_INBUCKET_URL="http://127.0.0.1:9000"
```

## 🚀 Step 5: Deploy Your App

### Option A: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.production`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.production`

### Option C: GitHub Pages

1. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

## ✅ Step 6: Verify Deployment

### 6.1 Test Core Functionality
1. **Visit your deployed app**
2. **Test authentication**:
   - Register new user
   - Login with admin@example.com
3. **Test admin features**:
   - Access admin dashboard
   - Create/edit/delete classes
   - Manage waivers (create, set active)
4. **Test user features**:
   - Browse classes (cancelled classes visibly marked)
   - Register for classes (confirmation email)
   - Signup flow requires agreeing to waiver (email sent with snapshot)

### 6.2 Check Database
1. Go to Supabase Dashboard → **Table Editor**
2. Verify tables are populated
3. Confirm new tables exist: `waivers`, `user_waivers`
4. Check RLS policies are working

## 🔄 Step 7: Switch Between Environments

### Local Development
```bash
# Use local Supabase
npm run dev
# Uses .env.local with 127.0.0.1:54321
```

### Production
```bash
# Deploy with production settings
vercel --prod
# Uses .env.production with remote Supabase
```

## 🛡️ Security Checklist

- [ ] **RLS Policies**: All tables have proper security policies
- [ ] **Admin Access**: Only admin@example.com can access admin features
- [ ] **Environment Variables**: Sensitive data not in code
- [ ] **HTTPS**: Production site uses HTTPS
- [ ] **CORS**: Supabase configured for your domain

## 📊 Monitoring

### Supabase Dashboard
- **Database**: Monitor query performance
- **Authentication**: Track user signups/logins
- **Storage**: Monitor file uploads (if using)
- **Logs**: Check for errors

### App Monitoring
- **Vercel Analytics**: Track app performance
- **Error Tracking**: Set up error monitoring (Sentry, etc.)

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase Auth Settings → Site URL
   - Ensure domain is whitelisted

2. **RLS Policy Errors**
   - Verify user is authenticated
   - Check admin email matches exactly

3. **Environment Variables**
   - Ensure all variables are set in deployment platform
   - Check for typos in URLs/keys

4. **Database Connection**
   - Verify Supabase project is active
   - Check API keys are correct

## 📈 Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure SSL certificates** (automatic with Vercel/Netlify)
3. **Set up monitoring and analytics**
4. **Waivers & Email phase**: finalize templates and provider
5. **(Postponed) Payments**: integrate Square
6. **Set up automated backups**

## 🎯 Production Checklist

- [ ] Database schema deployed (schema.sql + waivers.sql)
- [ ] Environment variables configured (Supabase + Email)
- [ ] Authentication working
- [ ] Admin access verified
- [ ] Waiver agreement required and persisted
- [ ] Registration & cancellation emails delivered
- [ ] All features tested
- [ ] Performance optimized
- [ ] Error monitoring set up
- [ ] Backup strategy in place

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or [Discord Community](https://discord.supabase.com).
