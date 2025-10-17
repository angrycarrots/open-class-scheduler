# 🧘‍♀️ Open Class Scheduling System

As a yoga studio owner, I need a comprehensive React-based yoga class scheduling system with authentication, payment processing, and admin functionality. Built with modern web technologies and a focus on user experience.  Great solution for small studios or individual.  A inexpensive alternative to GymCatch, Aquity and Taramala.

Makes use of Supabase for the database and authentication.  I use the free version.  I deploy on Azure Static Web Apps - free version.

Rather than integrated payment processing, I use external payment processors.  I use Square for in person payments and PayPal for online payments.  I use Venmo for online payments.  I use Zelle for online payments.  This opens more payment options for the studio owner and allows for more flexibility in payment processing with fewer fees.

I use this in production for my yoga studio for donation classes - it works great.  I would like to see the project grow and improve.  I am open to contributions and suggestions.

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

### 📊 Embedded solution for an existing web site
- No need to build a separate website
- Can be embedded in an existing website  - I use it in production for my yoga studio with an iframe 
- Can be used as a standalone application


## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **React Router DOM** for client-side routing
- **React Hook Form** with Zod validation
- **React Query** for data fetching and caching

### Backend
- **Supabase** for database and authentication - I use the free version.
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live updates

### Development Tools
- **ESLint** for code quality
- **TypeScript** for type safety
- **PostCSS** for CSS processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (optional, for local Supabase development)
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
see env.template
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SQUARE_LINK=https://square.link/u/your-square-link
VITE_VENMO_LINK=https://venmo.com/your-venmo-username
VITE_PAYPAL_LINK=https://paypal.me/your-paypal-username
VITE_ZELLE_LINK=https://www.zellepay.com/
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
