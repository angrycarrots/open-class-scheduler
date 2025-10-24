import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ClassListing } from './pages/ClassListing';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { ClassRegistration } from './pages/ClassRegistration';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminWaiver } from './pages/AdminWaiver';
import { AdminEnrolled } from './pages/AdminEnrolled';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient();

export const OpenClassScheduler: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<ClassListing />} />
              <Route path="/auth" element={<ProtectedRoute requireAuth={false}><Auth /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/register/:classId" element={<ProtectedRoute><ClassRegistration /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/waivers" element={<ProtectedRoute adminOnly><AdminWaiver /></ProtectedRoute>} />
              <Route path="/admin/enrolled" element={<ProtectedRoute adminOnly><AdminEnrolled /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};



const defaultQueryClient = new QueryClient();

export type OpenClassSchedulerProps = {
  provideAuth?: boolean;           // whether to wrap with AuthProvider
  provideQueryClient?: boolean;    // whether to wrap with QueryClientProvider
  queryClient?: QueryClient;       // optional custom client
  basePath?: string;               // optional base path (host can mount at /scheduler)
};

export const OpenClassSchedulerCore: React.FC<OpenClassSchedulerProps> = ({
  provideAuth = false,
  provideQueryClient = false,
  queryClient = defaultQueryClient,
}) => {
  const app = (
    <div className="App">
      <Routes>
        <Route path="/" element={<ClassListing />} />
        <Route path="/auth" element={<ProtectedRoute requireAuth={false}><Auth /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/register/:classId" element={<ProtectedRoute><ClassRegistration /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/waivers" element={<ProtectedRoute adminOnly><AdminWaiver /></ProtectedRoute>} />
        <Route path="/admin/enrolled" element={<ProtectedRoute adminOnly><AdminEnrolled /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );

  const withAuth = provideAuth ? <AuthProvider>{app}</AuthProvider> : app;
  return provideQueryClient ? <QueryClientProvider client={queryClient}>{withAuth}</QueryClientProvider> : withAuth;
};
