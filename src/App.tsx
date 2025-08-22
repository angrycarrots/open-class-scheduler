import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ClassListing } from './pages/ClassListing';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { ClassRegistration } from './pages/ClassRegistration';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminWaiver } from './pages/AdminWaiver';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

// Create a client
const queryClient = new QueryClient();

function App() {
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
