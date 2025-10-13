# Supabase Setup Guide

## Overview
This guide documents the complete Supabase setup for the Yoga Class Scheduling System.

## Prerequisites
- Docker Desktop installed and running
- Node.js and npm
- Supabase CLI installed via Homebrew

## Installation Steps

### 1. Install Supabase CLI
```bash
brew install supabase/tap/supabase
```

### 2. Initialize Supabase Project
```bash
supabase init --force
```

### 3. Start Local Supabase
```bash
supabase start
```

### 4. Apply Database Schema
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/schema.sql
```

### 5. Configure Environment Variables
Copy the template and update with your credentials:
```bash
cp env.template .env.local
```

## Database Schema

### Tables Created
- `profiles` - User profile information
- `yoga_classes` - Class details and scheduling
- `class_registrations` - Registration and payment tracking

### Key Features
- Row Level Security (RLS) policies
- Automatic profile creation on user signup
- Updated timestamps triggers
- Sample data for testing
- Admin role flag stored on `profiles.is_admin`

### Views Created
- `class_details` - Class information with registration counts
- `user_registrations` - User registrations with class details

## Local Development URLs

- **API URL**: http://127.0.0.1:54321
- **GraphQL URL**: http://127.0.0.1:54321/graphql/v1
- **Studio URL**: http://127.0.0.1:54323
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Optional Variables (for Phase 5)
```env
# Square Payments API
VITE_SQUARE_APPLICATION_ID=your-square-app-id
VITE_SQUARE_LOCATION_ID=your-square-location-id

# SMS Service
VITE_TWILIO_ACCOUNT_SID=your-twilio-account-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-auth-token
VITE_TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

## Testing the Setup

### 1. Test Database Connection
```bash
node test-supabase.js
```

### 2. Test Authentication
- Visit http://localhost:5173
- Try registering a new user
- Test login functionality

### 3. Test Admin Access
- Create or promote an account by setting `profiles.is_admin = TRUE`
- Navigate to /admin
- Test class creation and management

## Sample Data

The schema includes sample yoga classes:
- Morning Flow ($12)
- Power Yoga ($15)
- Restorative Yoga ($10)
- Weekly Meditation ($8, repeats for 4 weeks)

## Security Features

### Row Level Security (RLS)
- Users can only view their own profiles
- Users can only view their own registrations
- Public can view non-cancelled classes
- Admins have full access to all data

### Admin Access
- Accounts with `profiles.is_admin = TRUE`
- Full CRUD operations on classes
- View all registrations and attendees
- Manage class schedules

## Troubleshooting

### Common Issues

1. **Docker not running**
   ```bash
   open -a Docker
   ```

2. **Port conflicts**
   - Check if ports 54321-54324 are available
   - Stop other services using these ports

3. **Database connection issues**
   ```bash
   supabase stop
   supabase start
   ```

4. **Schema not applied**
   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/schema.sql
   ```

### Useful Commands

```bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Reset database
supabase db reset

# View logs
supabase logs

# Access database directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Production Deployment

For production deployment:

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key
3. Update environment variables
4. Apply the schema to your production database
5. Configure authentication settings

## Next Steps

With Supabase fully configured, you can now:
1. Test the complete authentication flow
2. Create and manage yoga classes
3. Register users for classes
4. View attendee information
5. Proceed to Phase 5: Payment Integration
