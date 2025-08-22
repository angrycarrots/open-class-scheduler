# 🧘‍♀️ Yoga Class Scheduling System

A comprehensive React-based yoga class scheduling system with authentication, payment processing, and admin functionality. Built with modern web technologies and a focus on user experience.  Great solution for small studios or individual.  A inexpensive alternative to GymCatch, Aquity and Taramala.

## ✨ Features

### 🎯 Core Functionality
- **User Authentication**: Secure registration, login, and profile management
- **Class Browsing**: View classes with advanced filtering and sorting
- **Class Registration**: Register for classes with adjustable payment amounts
- **Admin Dashboard**: Complete class management system for administrators
- **Responsive Design**: Mobile-first design that works on all devices

### 🔐 Authentication & Security
- Supabase authentication with email/password
- Row Level Security (RLS) policies
- Protected routes for admin access
- User profile management with avatar support

### 📅 Class Management
- Create, edit, duplicate, cancel, and delete classes
- Weekly repeat functionality (0-26 weeks)
- Instructor assignment and scheduling
- Price management and payment tracking

### 👥 User Management
- Attendee tracking and management
- Registration history and payment status
- SMS confirmation system (ready for integration)
- User profile customization

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Router DOM** for client-side routing
- **React Hook Form** with Zod validation
- **React Query** for data fetching and caching

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **PostCSS** for CSS processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for local Supabase development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/angrycarrots/yoga-class-scheduler.git
   cd yoga-class-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start Supabase (local development)**
   ```bash
   # Install Supabase CLI if not already installed
   brew install supabase/tap/supabase
   
   # Start local Supabase
   supabase start
   
   # Apply database schema
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - App: http://localhost:5173
   - Supabase Studio: http://127.0.0.1:54323

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ClassCard.tsx   # Individual class display card
│   ├── ClassFilters.tsx # Filtering and sorting component
│   ├── ProtectedRoute.tsx # Protected route component
│   └── AttendeeModal.tsx # Attendee management modal
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/              # Custom React hooks
│   ├── useClasses.ts   # Class data management hooks
│   └── useRegistrations.ts # Registration management hooks
├── pages/              # Page components
│   ├── Auth.tsx        # Authentication page
│   ├── ClassListing.tsx # Main class listing page
│   ├── ClassRegistration.tsx # Class registration page
│   ├── Profile.tsx     # User profile page
│   └── AdminDashboard.tsx # Admin dashboard
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
├── utils/              # Utility functions
│   ├── supabase.ts     # Supabase client configuration
│   ├── sms.ts          # SMS notification utilities
│   └── weeklyRepeat.ts # Weekly repeat functionality
└── App.tsx             # Main application component
```

## 🔧 Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
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

## 📊 Database Schema

### Tables
- `profiles` - User profile information
- `yoga_classes` - Class details and scheduling
- `class_registrations` - Registration and payment tracking

### Key Features
- Row Level Security (RLS) policies
- Automatic profile creation on user signup
- Updated timestamps triggers
- Sample data for testing

## 🎮 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🧪 Testing

The project includes comprehensive testing:
- Database connection tests
- Authentication system tests
- Component functionality tests
- Build process verification

Run tests with:
```bash
# All tests are integrated into the development workflow
npm run dev
# Then visit http://localhost:5173 to test the application
```

## 🚀 Deployment

### Local Development
- Development server: http://localhost:5173
- Supabase API: http://127.0.0.1:54321
- Supabase Studio: http://127.0.0.1:54323

### Production
1. Set up a Supabase project
2. Update environment variables
3. Deploy to your preferred hosting platform
4. Configure custom domain (optional)

## 📈 Current Status

### ✅ Completed Features
- **Phase 1**: Project Setup & Foundation
- **Phase 2**: Authentication & User Management
- **Phase 3**: Core Components
- **Phase 4**: Admin Functionality
- **Supabase Setup**: Complete local development environment

### 🔄 In Progress
- **Phase 5**: Payment Integration & Polish

### 📋 Roadmap
- Square payment integration
- Enhanced user experience
- Performance optimization
- Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This software is provided "as is" and without any warranty of any kind.
The author(s) make no representations or warranties, express or implied,
regarding the accuracy, reliability, or suitability of this software for
any particular purpose. Use of this software is at your own risk.

In no event shall the author(s) be held liable for any claim, damages, 
or other liability (whether in an action of contract, tort, or otherwise) 
arising from, out of, or in connection with the software or its use.

By using this software, you acknowledge and agree that you are solely 
responsible for any outcomes, issues, or consequences resulting from 
its use.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend-as-a-service
- [React](https://reactjs.org) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Vite](https://vitejs.dev) for the build tool

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [Supabase Setup Guide](SUPABASE_SETUP.md)
- Review the [Development Plan](PLAN.md)

---

**Built with ❤️ using React, TypeScript, and Supabase** 
