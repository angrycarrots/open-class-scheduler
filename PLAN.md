# Yoga Class Scheduling System - Development Plan

## Project Overview
A comprehensive React-based yoga class scheduling system with authentication, payment processing, and admin functionality.

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Email**: Provider-agnostic module (local via Inbucket/Mailpit, prod via SMTP/provider)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **State Management**: React Query

## Development Phases

### ✅ Phase 1: Project Setup & Foundation (COMPLETED)
- [x] Initialize React project with TypeScript and Vite
- [x] Configure Tailwind CSS and PostCSS
- [x] Install and configure dependencies
- [x] Set up project structure (components, pages, contexts, types, utils)
- [x] Create TypeScript type definitions
- [x] Configure Supabase client
- [x] Set up authentication context
- [x] Create basic routing structure
- [x] Implement responsive design foundation

### ✅ Phase 2: Authentication & User Management (COMPLETED)
- [x] Implement authentication system with Supabase
- [x] Create login/register components
- [x] Set up user context and hooks
- [x] Implement protected routes
- [x] Remove SMS from flow; email will be notification channel
- [x] Create user profile management
- [x] Implement profile update functionality
- [x] Add default avatar handling
- [x] Create profile page component

### ✅ Phase 3: Core Components (COMPLETED)
- [x] Create class listing component
- [x] Implement responsive grid layout
- [x] Add filtering and sorting options
- [x] Create class registration flow
- [x] Implement registration form
- [x] Add payment integration preparation (Square ready)
- [x] Create class registration page
- [x] Add payment amount adjustment (up to $12)
- [x] Implement registration success flow

### ✅ Phase 4: Admin Functionality (COMPLETED)
- [x] Create admin dashboard
- [x] Implement admin route protection
- [x] Create "Create New Class" form
- [x] Add weekly repeat functionality (0-26 weeks)
- [x] Implement class management (view, edit, duplicate, cancel, delete)
- [x] Create attendee management system
- [x] Add admin-only navigation
- [x] Implement class duplication with time reset
- [x] Add bulk class operations

### ✅ Supabase Setup (COMPLETED)
- [x] Install and configure Supabase CLI
- [x] Set up local Supabase development environment
- [x] Create comprehensive database schema
- [x] Implement Row Level Security (RLS) policies
- [x] Set up authentication triggers and functions
- [x] Create sample data for testing
- [x] Configure environment variables
- [x] Test database connection and functionality

### ⏳ Phase 5: Waivers & Email Notifications (PENDING)
- [ ] Add waiver tables and policies:
  - `waivers` (id, version, title, body_markdown, is_active, created_at, updated_at)
  - `user_waivers` (user_id, waiver_id, agreed_at, waiver_snapshot_md)
  - RLS to restrict reads/writes appropriately
- [ ] Admin Waiver management UI (CRUD, set active, preview)
- [ ] Signup flow changes:
  - Require agreement to the active waiver (checkbox + modal/preview)
  - Remove phone number from forms and schemas
  - Persist acceptance snapshot in `user_waivers`
- [ ] Email service module (provider-agnostic; local uses Inbucket)
- [ ] Emails to send:
  - Waiver terms email upon agreement (include snapshot)
  - Class registration confirmation email
  - Class cancellation email to all registrants
- [ ] UI: show cancelled classes in listing with clear "Cancelled" badge

### ⏸️ Phase 6: Payments (POSTPONED)
- [ ] Integrate Square payments API
- [ ] Implement payment form with amount adjustment
- [ ] Add payment confirmation handling

### ⏳ Phase 7: Testing & Deployment (PENDING)
- [ ] Write component tests
- [ ] Add integration tests
- [ ] Implement error boundary components
- [ ] Add performance optimization
- [ ] Create production build configuration
- [ ] Set up deployment pipeline
- [ ] Add monitoring and analytics
- [ ] Create user documentation

## Current Status

### ✅ Completed Features
1. **Project Foundation**
   - React + TypeScript + Vite setup
   - Tailwind CSS configuration
   - Project structure and organization
   - Development server running

2. **Authentication System**
   - Supabase client configuration
   - AuthContext with user management
   - Login/Register forms with validation
   - Protected route setup

3. **Core Components**
   - ClassCard component with expandable details
   - ClassListing page with responsive grid
   - Header navigation with user controls
   - TypeScript type definitions

4. **Database Schema**
   - Complete SQL setup for Supabase
   - Row Level Security policies
   - User profiles, classes, and registrations tables

5. **Supabase Integration**
   - Local Supabase development environment
   - Database schema with tables, triggers, and functions
   - Sample data for testing
   - Environment variables configured
   - Authentication system fully functional

### 🔄 In Progress
- Waiver schema and admin UI
- Email notifications module and flows

### ⏳ Next Priority Tasks
1. **Waivers & Email**
   - Build `waivers`/`user_waivers` with RLS
   - Admin Waiver management page
   - Update signup flow to require waiver agreement
   - Implement email sends (agreement, registration, cancellation)
2. **UI Polish**
   - Persist cancelled classes in list with explicit badge
3. **Payments (Postponed)**
   - Square integration after Phase 5 completion

## Database Schema Status

### ✅ Implemented Tables
- `profiles` - User profile information
- `yoga_classes` - Class details and scheduling
- `class_registrations` - Registration and payment tracking

### 🔜 Planned Additions (Phase 5)
- `waivers` and `user_waivers` for agreement tracking

### ✅ Security Policies
- Row Level Security enabled
- User-specific data access
- Admin-only class management
- Public class viewing

## Environment Configuration Needed

### Required Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Email Configuration
VITE_EMAIL_FROM="Yoga Classes <no-reply@yoursite>"
VITE_EMAIL_PROVIDER="smtp"           # or provider id
VITE_EMAIL_SMTP_HOST=127.0.0.1        # local Inbucket/Mailpit
VITE_EMAIL_SMTP_PORT=1025             # local dev port
VITE_EMAIL_SMTP_USER=
VITE_EMAIL_SMTP_PASS=

# (Postponed) Square API Configuration
# VITE_SQUARE_APPLICATION_ID=your_square_application_id_here
# VITE_SQUARE_LOCATION_ID=your_square_location_id_here
```

## File Structure

```
src/
├── components/          # Reusable UI components
│   ├── ClassCard.tsx    # ✅ Individual class display card
│   ├── ClassFilters.tsx # ✅ Filtering and sorting component
│   ├── ProtectedRoute.tsx # ✅ Protected route component
│   └── AttendeeModal.tsx # ✅ Attendee management modal
├── contexts/            # React contexts
│   └── AuthContext.tsx  # ✅ Authentication context
├── hooks/               # Custom React hooks
│   ├── useClasses.ts    # ✅ Class data management hooks
│   └── useRegistrations.ts # ✅ Registration management hooks
├── pages/               # Page components
│   ├── Auth.tsx         # ✅ Authentication page
│   ├── ClassListing.tsx # ✅ Main class listing page
│   ├── ClassRegistration.tsx # ✅ Class registration page
│   ├── Profile.tsx      # ✅ User profile page
│   └── AdminDashboard.tsx # ✅ Admin dashboard
├── pages/admin/         # New admin pages
│   └── WaiverAdmin.tsx  # 🔜 Waiver management
├── types/               # TypeScript type definitions
│   └── index.ts         # ✅ Main type definitions
├── utils/               # Utility functions
│   ├── supabase.ts      # ✅ Supabase client configuration
│   ├── email.ts         # 🔜 Email notification utilities
│   └── weeklyRepeat.ts  # ✅ Weekly repeat functionality
└── App.tsx              # ✅ Main application component
```

## Immediate Next Steps

1. **Implement Waivers**
   - SQL + RLS for `waivers` and `user_waivers`
   - Admin Waiver UI
   - Signup flow change + persistence
2. **Email Integration**
   - Provider-agnostic module (SMTP for local)
   - Templates for waiver agreement, registration, cancellation
3. **UI Update**
   - Persist and badge "Cancelled" classes in list and details

## Notes

- Development server is running at `http://localhost:5173`
- All core dependencies are installed and configured
- TypeScript types are comprehensive and well-defined
- Supabase local development environment is running at `http://127.0.0.1:54321`
- Supabase Studio is available at `http://127.0.0.1:54323`
- Database schema is applied with sample data
- Authentication system is fully functional
- Responsive design is implemented with Tailwind CSS
- All linting and TypeScript compilation issues have been resolved
- Build process is working correctly
- Phase 4 admin functionality is complete and tested
- Bundle size: 514 KB (reasonable)
- All tests passing ✅ (10/10)
- Ready for Phase 5: Waivers & Email Notifications

## Success Criteria

- [ ] Users can view and register for yoga classes
- [ ] Authentication system works seamlessly
- [ ] Admin can manage classes effectively
- [ ] Email notifications are sent for waiver agreement, registration, and cancellations
- [ ] Users must agree to an admin-defined waiver during signup; acceptance is persisted
- [ ] Cancelled classes remain listed and are clearly marked "Cancelled"
- [ ] Application is fully responsive
- [ ] All forms have proper validation
- [ ] Error handling is comprehensive
