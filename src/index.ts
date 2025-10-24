export { OpenClassScheduler } from './App';

// Core providers and auth hooks
export { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages (route components)
export { ClassListing } from './pages/ClassListing';
export { ClassRegistration as ClassRegistrationPage } from './pages/ClassRegistration';
export { Auth } from './pages/Auth';
export { Profile } from './pages/Profile';
export { AdminDashboard } from './pages/AdminDashboard';
export { AdminWaiver } from './pages/AdminWaiver';
export { AdminEnrolled } from './pages/AdminEnrolled';

// UI components and route guards
export { ClassCard } from './components/ClassCard';
export { ProtectedRoute } from './components/ProtectedRoute';

// Shared types
export type {
  User,
  YogaClass,
  ClassRegistration,
  CreateClassData,
  UpdateClassData,
  AuthContextType,
} from './types';
