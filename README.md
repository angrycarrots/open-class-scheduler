# Yoga Class Scheduling System

A comprehensive React-based yoga class scheduling system with authentication, payment processing, and admin functionality.

## Features

- **User Authentication**: Sign up, sign in, and profile management with Supabase
- **Class Listing**: View available yoga classes with expandable details
- **Class Registration**: Register for classes with Square payment integration
- **Admin Panel**: Create, edit, duplicate, cancel, and delete classes
- **SMS Notifications**: Confirmation messages for registrations and new users
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Square API
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **State Management**: React Query

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Square Developer account (for payments)
- SMS service account (for notifications)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd yoga_c
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Square API Configuration (for payments)
VITE_SQUARE_APPLICATION_ID=your_square_application_id_here
VITE_SQUARE_LOCATION_ID=your_square_location_id_here

# SMS Service Configuration (for notifications)
VITE_SMS_API_KEY=your_sms_api_key_here
VITE_SMS_PHONE_NUMBER=your_sms_phone_number_here
```

### 3. Supabase Database Setup

1. Create a new Supabase project
2. Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT DEFAULT 'avatar.png',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create yoga_classes table
CREATE TABLE yoga_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  instructor TEXT NOT NULL DEFAULT 'Michael',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  weekly_repeat INTEGER DEFAULT 0 CHECK (weekly_repeat >= 0 AND weekly_repeat <= 26),
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_registrations table
CREATE TABLE class_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES yoga_classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  square_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_registrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view yoga classes" ON yoga_classes
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage yoga classes" ON yoga_classes
  FOR ALL USING (auth.jwt() ->> 'email' = 'admin@example.com');

CREATE POLICY "Users can view their own registrations" ON class_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" ON class_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all registrations" ON class_registrations
  FOR SELECT USING (auth.jwt() ->> 'email' = 'admin@example.com');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ClassCard.tsx   # Individual class display card
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── Auth.tsx        # Authentication page
│   └── ClassListing.tsx # Main class listing page
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── utils/              # Utility functions
│   └── supabase.ts     # Supabase client configuration
└── App.tsx             # Main application component
```

## Usage

### For Users
1. Visit the homepage to view available classes
2. Click "Login" to sign in or create an account
3. Click "Register" on any class to book it
4. Complete payment through Square
5. Receive SMS confirmation

### For Admins
1. Sign in with admin credentials (admin@example.com)
2. Click "Admin" button to access admin panel
3. Create, edit, or manage classes
4. View class registrations and attendees

## Development Status

This is the initial implementation with the following completed:

✅ Project setup and configuration  
✅ Authentication system  
✅ Class listing and display  
✅ Basic routing  
✅ TypeScript types  
✅ Responsive design  

**Next Steps:**
- [ ] Class registration and payment flow
- [ ] Admin panel implementation
- [ ] SMS notification integration
- [ ] Profile management
- [ ] Square API integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
